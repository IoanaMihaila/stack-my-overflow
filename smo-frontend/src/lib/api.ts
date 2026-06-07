// src/lib/api.ts - toate request-urile trec prin aceasta functie
const API_URL = import.meta.env.VITE_API_URL; // ex: http://localhost:3000
// ATENTIE: prefixul VITE_ este obligatorui! Fara el, valoarea e undefined.

export async function request(path: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('smo_token'); // token-ul salvat la login

    const res = await fetch(API_URL + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            // Adaugam token-ul daca exista (rute protejate)
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            ...(options.headers || {}), // permitem suprascrierea headerelor
        },
    });

    // 1. Tratare caz 401 (Token expirat -> Silent Refresh)
    // Evităm bucla infinită verificând dacă nu cumva chiar request-ul de refresh a dat 401
    if (res.status === 401 && path !== '/auth/refresh') {
        const rt = localStorage.getItem('smo_refresh');
        if (rt) {
            try {
                const d = await request('/auth/refresh', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken: rt })
                });
                localStorage.setItem('smo_token', d.accessToken); // salvam noul token
                return request(path, options); // reincercam request-ul original
            } catch (refreshErr) {
                console.error("Refresh token-ul a esuat sau a expirat:", refreshErr);
                // Curățăm datele vechi pentru ca aplicația să știe că user-ul e delogat
                localStorage.removeItem('smo_token');
                localStorage.removeItem('smo_refresh');
                localStorage.removeItem('smo_user');
                throw new Error('Session expired. Please log in again.');
            }
        }
        throw new Error('Unauthorized');
    }

    // 2. REZOLVARE EROARE: Citim mai întâi ca text brut pentru a preveni crash-ul "Unexpected end of JSON"
    const responseText = await res.text();
    let data;
    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
        // Dacă serverul a trimis HTML sau text chior (ex: erori de proxy/Express)
        data = { error: responseText || `Request-ul a esuat cu status: ${res.status}` };
    }

    // 3. Dacă request-ul NU a fost ok, aruncăm obiectul de eroare procesat în siguranță
    if (!res.ok) {
        throw new Error(data.error || `Eroare server (Status ${res.status})`);
    }
    
    return data;
}

// =========================================================================
// Funcții exportate - componentele apeleaza astea, nu fetch() direct
// Avantaj: daca schimbi URL-ul sau structura, modifici intr-un singur loc
// =========================================================================

export const getQuestions = (tag?: string) => {
    // Dacă activeTag are o valoare (ex: "react"), path devine "/questions?tag=react"
    const path = tag ? `/questions?tag=${encodeURIComponent(tag)}` : '/questions';
    return request(path);
};

export const getQuestion = (id: string) => 
    request('/questions/' + id);

export const createQuestion = (data: any) => 
    request('/questions', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });

export const acceptAnswer = (id: string) => 
    request('/answers/' + id + '/accept', { 
        method: 'PATCH' 
    });

export const voteQuestion = (id: string, value: 1 | -1) => 
    request(`/questions/${id}/vote`, { 
        method: 'PATCH', 
        body: JSON.stringify({ value }) 
    });

// =========================================================================
// AI Feature — Lab 7 Functions
// =========================================================================

export const suggestTags = (title: string): Promise<{ tags: string[] }> =>
    request('/ai/tags', {
        method: 'POST',
        body: JSON.stringify({ title })
    });

export const aiHealth = (): Promise<{ ok: boolean; rateLimited?: boolean; provider?: string; model?: string }> =>
    request('/ai/health');