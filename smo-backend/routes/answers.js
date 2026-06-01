// smo-backend/routes/answers.js
const express = require('express');
// mergeParams: true permite citirea parametrilor de URL dacă ruta este apelată ierarhic
const router = express.Router({ mergeParams: true }); 
const supabase = require('../src/supabase');
const { requireAuth } = require('../middleware/auth');

// =========================================================================
// 1. POST /questions/:questionId/answers (Protejat)
// =========================================================================
router.post('/questions/:questionId/answers', requireAuth, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { body } = req.body;
        const author_id = req.user.id; 

        if (!body || !body.trim()) {
            return res.status(400).json({ error: 'Answer body cannot be empty.' });
        }

        const { data: question, error: qErr } = await supabase
            .from('questions')
            .select('id')
            .eq('id', questionId)
            .maybeSingle();

        if (qErr || !question) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        const { data: newAnswer, error: insertErr } = await supabase
            .from('answers')
            .insert({
                question_id: questionId,
                author_id,
                body: body.trim(),
                is_accepted: false,
                vote_count: 0
            })
            .select()
            .single();

        if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ error: 'Failed to create answer.' });
        }

        return res.status(201).json(newAnswer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// =========================================================================
// 2. PATCH /answers/:answerId/accept (Protejat - IMPLEMENTAT SUB SPECIFICAȚII)
// =========================================================================
router.patch('/answers/:answerId/accept', requireAuth, async (req, res) => {
    try {
        const { answerId } = req.params;
        const currentUserId = req.user.id;

        // Pasul A: Preluăm răspunsul și facem JOIN cu întrebarea părinte ca să verificăm autorul
        const { data: answer, error: ansErr } = await supabase
            .from('answers')
            .select('*, questions(*)')
            .eq('id', answerId)
            .maybeSingle();

        // Criteriu: Răspunsul nu există -> 404
        if (ansErr || !answer) {
            return res.status(404).json({ error: 'Answer not found.' });
        }

        const question = answer.questions;

        // Criteriu: Doar autorul întrebării poate accepta răspunsuri -> 403 Forbidden
        if (!question || question.author_id !== currentUserId) {
            return res.status(403).json({ error: 'Only the question author can accept answers.' });
        }

        // Criteriu: Permitem doar un singur răspuns acceptat per întrebare.
        // Resatăm (unaccept) statusul pentru toate celelalte răspunsuri ale aceleiași întrebări.
        const { error: resetErr } = await supabase
            .from('answers')
            .update({ is_accepted: false })
            .eq('question_id', question.id);

        if (resetErr) {
            console.error("Eroare la resetarea răspunsurilor anterioare:", resetErr);
            return res.status(500).json({ error: 'Failed to unaccept previous answers.' });
        }

        // Pasul B: Marcăm răspunsul curent ca acceptat (is_accepted = true)
        const { data: updatedAnswer, error: acceptErr } = await supabase
            .from('answers')
            .update({ is_accepted: true })
            .eq('id', answerId)
            .select()
            .single();

        if (acceptErr) {
            console.error("Eroare la acceptarea răspunsului:", acceptErr);
            return res.status(500).json({ error: 'Failed to accept answer.' });
        }

        // Pasul C: Marcăm întrebarea părinte ca rezolvată (is_solved = true)
        const { error: questionUpdateErr } = await supabase
            .from('questions')
            .update({ is_solved: true })
            .eq('id', question.id);

        if (questionUpdateErr) {
            console.error("Eroare la marcarea întrebării ca solved:", questionUpdateErr);
            // Nu blocăm răspunsul, dar e bine să logăm eroarea în consolă
        }

        // Returnăm răspunsul actualizat cu succes
        return res.status(200).json(updatedAnswer);
    } catch (err) {
        console.error("Crash pe ruta de accept answer:", err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;