require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json()); 

const authRoutes = require('../routes/auth'); 
const questionsRoutes = require('../routes/questions'); // Importat router întrebări
const answersRoutes = require('../routes/answers');
const aiRoutes = require('../routes/ai');

app.use('/auth', authRoutes);
app.use('/questions', questionsRoutes); // Legat router întrebări la calea potrivită
app.use('/ai', aiRoutes);

app.get('/health', (req, res) => {
    return res.status(200).json({ ok: true });
});

app.use('/', answersRoutes);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=== SERVERUL E VIU PE PORTUL ${PORT} ===`);
});