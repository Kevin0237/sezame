// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sezame API is running' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Backend Sezame en écoute sur http://localhost:${PORT}`);
});