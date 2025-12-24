const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// === НАЙВАЖЛИВІШЕ: ЯВНЕ ПІДКЛЮЧЕННЯ ПАПОК ===
// Ми кажемо серверу: "Якщо просять /css, шукай у папці public/css"
app.use('/css', express.static(path.join(__dirname, '../public/css')));

// "Якщо просять /assets, шукай у папці public/assets"
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// "Якщо просять /html, шукай у папці public/html"
app.use('/html', express.static(path.join(__dirname, '../public/html')));

// Також залишаємо загальний доступ (на всяк випадок)
app.use(express.static(path.join(__dirname, '../public')));


// === РОУТИ (API) ===
const booksRoutes = require('./routes/books');
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', booksRoutes);
app.use('/api/auth', authRoutes);


// === ГОЛОВНА СТОРІНКА ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html', 'index.html'));
});

// === ЗАПУСК ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});