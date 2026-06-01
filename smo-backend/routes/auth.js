const express = require('express'); 
const router = express.Router();    
const supabase = require('../src/supabase'); 

// 1. RUTA DE ÎNREGISTRARE (REGISTER)
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) 
        return res.status(400).json({ error: 'email, password si username sunt obligatorii' });

    // Verificăm dacă username-ul este unic
    const { data: existing, error: existErr } = await supabase.from('profiles')
        .select('id') // Cerem doar ID-ul, nu email-ul!
        .eq('username', username)
        .maybeSingle(); 
        
    if (existErr) {
        console.error("Eroare la verificarea username-ului unic:", existErr);
        return res.status(500).json({ error: 'Eroare la baza de date.' });
    }
    if (existing)
        return res.status(400).json({ error: 'Username deja folosit' });

    // Creăm utilizatorul în Supabase Auth
    const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (createErr)
        return res.status(400).json({ error: createErr.message });

    // MODIFICAT: Înlocuit .insert() cu .upsert() pentru a preveni eroarea de cheie duplicată (cod 23505)
    const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, username }); 
        
    if (profileErr) {
        await supabase.auth.admin.deleteUser(user.id);
        console.error("Eroare la crearea profilului în baza de date:", profileErr);
        return res.status(500).json({ error: 'Eroare la crearea profilului' });
    }

    // Logăm utilizatorul pentru a genera sesiunea
    const { data: sess, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr || !sess.session) {
        return res.status(500).json({ error: 'Contul a fost creat, dar logarea automata a esuat.' });
    }

    return res.status(201).json({
        accessToken: sess.session.access_token,
        refreshToken: sess.session.refresh_token,
        user: {
            id: user.id,
            username: username,
            email: email
        }
    });
});

// 2. RUTA DE AUTENTIFICARE (LOGIN)
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password) {
            return res.status(400).json({ error: 'Username/Email si parola sunt obligatorii' });
        }

        let targetEmail = usernameOrEmail;
        let cachedUsername = null;

        // Pasul A: Dacă valoarea NU conține '@', este un username
        if (!usernameOrEmail.includes('@')) {
            // CORECTAT: Selectăm DOAR id și username din profiles
            const { data: foundProfile, error: searchErr } = await supabase.from('profiles')
                .select('id, username') 
                .eq('username', usernameOrEmail)
                .maybeSingle();

            if (searchErr) {
                console.error("Eroare la cautarea username-ului:", searchErr);
                return res.status(500).json({ error: 'Eroare la verificarea contului.' });
            }

            if (!foundProfile) {
                return res.status(404).json({ error: 'Username-ul introdus nu exista.' });
            }

            // Deoarece tabela profiles nu are email, îl extragem din tabelul intern de Auth pe baza ID-ului
            const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(foundProfile.id);
            if (userErr || !userData.user) {
                console.error("Eroare la extragerea utilizatorului din Auth:", userErr);
                return res.status(404).json({ error: 'Nu s-a putut gasi emailul asociat acestui username.' });
            }

            targetEmail = userData.user.email;
            cachedUsername = foundProfile.username;
        }

        // Pasul B: Autentificarea oficială în Supabase Auth folosinf email-ul determinat
        const { data, error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
        if (error || !data.session) {
            return res.status(401).json({ error: 'Date de autentificare incorecte.' });
        }

        // Pasul C: Dacă s-a logat direct cu EMAIL, îi aflăm username-ul acum din profiles
        if (!cachedUsername) {
            const { data: foundProfile, error: profileErr } = await supabase.from('profiles')
                .select('username') // DOAR username!
                .eq('id', data.user.id)
                .maybeSingle();

            if (profileErr || !foundProfile) {
                console.error("Eroare la citirea profilului după login:", profileErr);
                return res.status(404).json({ error: 'Profilul asociat nu a fost gasit.' });
            }
            cachedUsername = foundProfile.username;
        }

        // Pasul D: Trimitem răspunsul curat către frontend
        return res.json({ 
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: { 
                id: data.user.id, 
                username: cachedUsername, 
                email: data.user.email
            }
        });

    } catch (err) {
        console.error("Crash pe ruta de login:", err);
        return res.status(500).json({ error: 'Eroare interna de server la autentificare.' });
    }
});

// 3. RUTA DE DECONECTARE (LOGOUT)
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await supabase.auth.signOut(token);
        }
        res.json({ message: 'Deconectare reusita' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Eroare interna la deconectare' });
    }
});

module.exports = router;