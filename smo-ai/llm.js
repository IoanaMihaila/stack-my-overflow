import OpenAI from 'openai';
import logger from './utils/logger.js';

const provider = process.env.LLM_PROVIDER || 'ollama';
let openai;
let model;

if (provider === 'groq') {
    openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
    });
    model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
} else {
    // Default to Ollama
    openai = new OpenAI({
        apiKey: 'ollama', // Ollama doesn't need a real key but the SDK requires a string
        baseURL: `${process.env.OLLAMA_URL || 'http://localhost:11434'}/v1`
    });
    model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
}

export async function generateTags(title) {
    try {
        const prompt = `Analyze the following title and return a JSON object containing an array of 3-5 relevant, lowercase tags. 
Title: "${title}"
Respond ONLY with a valid JSON object matching this schema: { "tags": ["tag1", "tag2"] }. Do not include markdown formatting or explanation.`;

        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" } // Ensures the LLM outputs clean JSON
        });

        const data = JSON.parse(response.choices[0].message.content);
        return data.tags || [];
    } catch (error) {
        logger.error(`LLM Generation error: ${error.message}`);
        return []; // Graceful fallback inside the microservice
    }
}