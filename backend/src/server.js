require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Monitoring dan Metrik
const client = require('prom-client');
// Mengumpulkan metrik default (CPU, RAM, Event Loop Node.js)
client.collectDefaultMetrics(); 

// Endpoint khusus yang akan "di-scrape" (disedot) oleh Prometheus secara berkala
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
});

// Middleware Keamanan
app.use(helmet());
app.use(cors());
app.use(express.json());

// Koneksi Database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware Validasi Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Token tidak tersedia.' });

    const tokenPart = token.split(' ')[1];
    jwt.verify(tokenPart, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Sesi tidak valid / kedaluwarsa.' });
        req.user = decoded; 
        next();
    });
};

// Endpoint Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Kredensial salah.' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log(`[SECURITY EVENT] Login Gagal: Username ${username}`);
            return res.status(401).json({ error: 'Kredensial salah.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        console.log(`[AUDIT LOG] User ${username} berhasil login.`);
        res.json({ message: 'Login berhasil', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend Server DevSecOps berjalan di port ${PORT}`);
});