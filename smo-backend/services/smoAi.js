// Note: use standard CommonJS require if your backend is configured that way
const axios = require('axios'); 

const SMO_AI_URL = process.env.SMO_AI_URL || 'http://localhost:3100';
const SMO_AI_SECRET = process.env.SMO_AI_SECRET;

async function fetchTagsFromAiService(title) {
    try {
        const response = await axios.post(`${SMO_AI_URL}/tags`, 
            { title }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': SMO_AI_SECRET
                },
                timeout: 25000 // 5 seconds max wait time
            }
        );
        return response.data.tags;
    } catch (error) {
        console.error(`[AI Service Down/Error]: ${error.message}`);
        return null; // Return null so the route knows it failed gracefully
    }
}

module.exports = { fetchTagsFromAiService };