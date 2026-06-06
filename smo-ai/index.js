import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';
import { generateTags } from './llm.js';

const INTERNAL_SECRET = process.env.SMO_AI_SECRET;
if(!INTERNAL_SECRET) {
    console.error('SMO_AI_SECRET is not set. Exiting.');
}

const app=express();
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use((req, res, next) => {
    if(req.path === '/health') return next();
    if(!INTERNAL_SECRET || req.headers['x-internal-secret'] !== INTERNAL_SECRET) 
        return res.status(401).json({ error: 'Unauthorized' });
    next();
})

const PORT = process.env.PORT || 3100;

app.get('/health', (req, res) => {
    // Returnează direct un răspuns de succes, fără să mai verifice limitarea
    return res.json({ ok: true, rateLimited: false });
});

app.post('/tags', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const tags = await generateTags(title);
        return res.json({ tags });
    } catch (error) {
        logger.error(`Failed to handle /tags request: ${error.message}`);
        return res.status(500).json({ error: 'Internal AI service error' });
    }
});


app.listen(PORT, () => {
    logger.info(`🚀 SMO AI Server running on port ${PORT}`);
    // Schimbat din PROVIDER în LLM_PROVIDER
    logger.info(`Provider: ${process.env.LLM_PROVIDER}`); 
});