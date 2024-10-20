// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const apiKey = 'Sv0sbNAjmZEGuWRsRwwkyVBYckogrQjl';
const externalUserId = 'Sandeep';

// Create chat session
app.post('/api/chat-session', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.on-demand.io/chat/v1/sessions',
      {
        pluginIds: [],
        externalUserId: externalUserId,
      },
      {
        headers: {
          apikey: apiKey,
        },
      }
    );
    res.json({ sessionId: response.data.data.id });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Submit query
app.post('/api/submit-query', async (req, res) => {
  const { sessionId, query } = req.body;
  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: query,
        pluginIds: [
          'plugin-1712327325',
          'plugin-1713962163',
          'plugin-1726656984',
          'plugin-1723275191',
          'plugin-1716330714'
        ],
        responseMode: 'sync',
      },
      {
        headers: {
          apikey: apiKey,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).json({ error: 'Failed to submit query' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});