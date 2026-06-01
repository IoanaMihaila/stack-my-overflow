//src/middleware/auth.js
const supabase = require('../src/supabase'); // Corectat calea către src/supabase

async function requireAuth(req, res, next) {
    const h=req.headers['authorization'];
    if (!h || !h.startsWith('Bearer ')) 
        return res.status(401).json({ error: 'Token lipsa sau format gresit' });
    const token=h.split(' ')[1];
    const { data: { user }, error }=await supabase.auth.getUser(token);
    if (error || !user)
        return res.status(401).json({ error: 'Token invalid sau expirat' });
    req.user=user;
    next();
}

module.exports = { requireAuth }; // Exportat pentru a putea fi refolosit în alte rute protejate