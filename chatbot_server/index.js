// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: "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", 
    organization: "org-s2t6D5a7HvBTtxvo9q4J4uDV",
});

app.use(cors()); // This will allow all origins by default
app.use(bodyParser.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
        });
        res.json(completion.choices[0].message);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred from the server', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
