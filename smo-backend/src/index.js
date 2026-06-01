require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json()); 

const authRoutes = require('../routes/auth'); 
const questionsRoutes = require('../routes/questions'); // Importat router întrebări
const answersRoutes = require('../routes/answers');

app.use('/auth', authRoutes);
app.use('/questions', questionsRoutes); // Legat router întrebări la calea potrivită

app.get('/health', (req, res) => {
    return res.status(200).json({ ok: true });
});

app.use('/', answersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server up and running on port ${PORT}`);
});