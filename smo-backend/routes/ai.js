const express = require('express');
const router = express.Router();
const { fetchTagsFromAiService } = require('../services/smoAi');
const axios = require('axios'); // Adăugăm axios și aici pentru health proxy

const SMO_AI_URL = process.env.SMO_AI_URL || 'http://localhost:3100';

// POST /ai/tags
router.post('/tags', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const tags = await fetchTagsFromAiService(title);
    
    if (tags === null) {
        return res.json({ tags: [] }); 
    }

    return res.json({ tags });
});

// GET /ai/health <-- ACEASTA lipsea și dădea 404!
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${SMO_AI_URL}/health`, { timeout: 2000 });
        return res.json(response.data);
    } catch (error) {
        // Dacă smo-ai (3100) e picat, returnăm ok: false în loc de crash
        return res.json({ ok: false });
    }
});

module.exports = router;