require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

// PORT (Render automatikusan ad egyet)
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statikus fájlok (public mappa)
app.use(express.static(path.join(__dirname, 'public')));

// Főoldal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Teszt API
app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Szerver működik 🚀'
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('404 - Nincs ilyen oldal');
});

// Szerver indítás
app.listen(PORT, () => {
  console.log(`Server fut a ${PORT} porton`);
});
