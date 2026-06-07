const express = require('express');
const router = express.Router();
const supabase = require('../src/supabase');
const { requireAuth } = require('../middleware/auth');

// =========================================================================
// 1. GET /questions (Listare pe Pagina Principală)
// =========================================================================
router.get('/', async (req, res) => {
    try {
        // 1. Extragere tag din query parameter-ul trimis de React (?tag=typescript)
        const { tag } = req.query;

        const { data, error } = await supabase.from('questions')
            .select('*, author:profiles!author_id(id, username), question_tags(tag:tags(name)), answers(id)')
            .order('created_at', { ascending: false });

        if (error)
            return res.status(500).json({ error: error.message });

        let filteredData = data || [];

        // 2. LOGICA STRETCH: Dacă a fost trimis un tag pentru filtrare
        if (tag) {
            const searchTag = String(tag).toLowerCase().trim();
            
            filteredData = filteredData.filter(q => {
                // Verificăm dacă întrebarea are structura junction populată cu tag-ul căutat
                return q.question_tags && q.question_tags.some(qt => {
                    const currentTagName = qt.tag?.name || "";
                    return currentTagName.toLowerCase().trim() === searchTag;
                });
            });
        }

        // 3. Maparea întrebărilor (rămâne exact logica ta originală, dar aplicată pe datele filtrate)
        const questions = filteredData.map(q => {
            const actualCount = q.answers ? q.answers.length : 0;
            return {
                id: q.id,
                title: q.title,
                description: q.description,
                created_at: q.created_at, 
                vote_count: q.vote_count || 0,
                is_solved: q.is_solved || false,
                author: q.author,
                answer_count: actualCount,
                question_tags: q.question_tags || []
            };
        });

        return res.json({ questions });
    } catch (err) {
        console.error("Eroare la maparea listei de intrebari:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// =========================================================================
// 2. GET /questions/:id (Detalii Întrebare + Răspunsuri)
// =========================================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: question, error: qErr } = await supabase
            .from('questions')
            .select('*, author:profiles!author_id(id, username), question_tags(tag:tags(name))')
            .eq('id', id)
            .maybeSingle();

        if (qErr || !question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const { data: answers, error: aErr } = await supabase
            .from('answers')
            .select('*, author:profiles!author_id(id, username)')
            .eq('question_id', id)
            .order('is_accepted', { ascending: false })
            .order('created_at', { ascending: true });

        if (aErr) return res.status(500).json({ error: aErr.message });

        question.answers = answers || [];
        question.answer = answers || [];
        question.question_tags = question.question_tags || [];

        return res.json({ question });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// =========================================================================
// 3. POST /questions (Creare Întrebare Nouă)
// =========================================================================
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, description, tags = [] } = req.body;

        if (!title?.trim() || !description?.trim())
            return res.status(400).json({ error: 'Title si description sunt obligatorii' });

        const { data: question, error } = await supabase.from('questions')
            .insert({ title, description, author_id: req.user.id })
            .select()
            .single();

        if (error)
            return res.status(500).json({ error: error.message });

        for (const tagName of tags) {
            if (!tagName.trim()) continue;
            const { data: tag, error: tagErr } = await supabase.from('tags')
                .upsert({ name: tagName.toLowerCase().trim() }, { onConflict: 'name' })
                .select()
                .single();

            if (!tagErr && tag) {
                await supabase.from('question_tags')
                    .insert({ question_id: question.id, tag_id: tag.id });
            }
        }

        return res.status(201).json({ question });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// =========================================================================
// 4. PATCH /questions/:id/vote (Votare Întrebare - REZOLVAT & SECURIZAT)
// =========================================================================
router.patch('/:id/vote', requireAuth, async (req, res) => {
    try {
        const { value } = req.body;
        if (value !== 1 && value !== -1) {
            return res.status(400).json({ error: 'Value trebuie sa fie 1 sau -1' });
        }

        const qId = req.params.id;
        const uId = req.user.id;

        // Verificăm mai întâi dacă întrebarea chiar există în baza de date
        const { data: questionCheck, error: qCheckErr } = await supabase
            .from('questions')
            .select('id')
            .eq('id', qId)
            .maybeSingle();

        if (qCheckErr || !questionCheck) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Căutăm dacă utilizatorul a mai votat deja această întrebare
        const { data: v, error: vError } = await supabase.from('votes')
            .select('*')
            .eq('target_id', qId)
            .eq('target_type', 'question')
            .eq('user_id', uId)
            .maybeSingle();

        if (vError) {
            return res.status(500).json({ error: vError.message });
        }

        let delta = value;

        if (v) {
            if (v.value === value) {
                // Utilizatorul a apăsat pe același buton -> Anulăm votul complet
                const { error: delErr } = await supabase.from('votes').delete().eq('id', v.id);
                if (delErr) return res.status(500).json({ error: delErr.message });
                delta = -value;
            } else {
                // Utilizatorul a schimbat votul (de la +1 la -1 sau invers) -> Schimbăm valoarea
                const { error: updErr } = await supabase.from('votes').update({ value }).eq('id', v.id);
                if (updErr) return res.status(500).json({ error: updErr.message });
                delta = value * 2;
            }
        } else {
            // Vot nou
            const { error: insErr } = await supabase.from('votes').insert({ 
                target_id: qId, 
                target_type: 'question', 
                user_id: uId, 
                value 
            });
            if (insErr) return res.status(500).json({ error: insErr.message });
        }

        // Executăm funcția atomică RPC din baza de date
        const { error: rpcErr } = await supabase.rpc('increment_question_votes', { 
            q_id: qId, 
            delta: parseInt(delta, 10) 
        });
        
        if (rpcErr) {
            console.error("RPC Error:", rpcErr);
            return res.status(500).json({ error: "Eroare la actualizarea contorului de voturi: " + rpcErr.message });
        }
        
        // Luăm valoarea proaspătă direct din tabelul questions
        const { data: q, error: fetchErr } = await supabase.from('questions')
            .select('vote_count')
            .eq('id', qId)
            .single();

        if (fetchErr || !q) {
            return res.status(500).json({ error: 'Nu s-a putut prelua noul scor.' });
        }

        return res.json({ vote_count: q.vote_count });
    } catch (err) {
        console.error("Eroare la procesarea votului:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/health', (req, res) => {
    return res.json({ ok: true });
});

module.exports = router;