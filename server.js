require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;
const sslPort = process.env.SSL_PORT || 3443;
const useSsl = process.env.USE_SSL === 'true';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация базы данных
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database', err);
    } else {
        console.log('Connected to the database');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            login_date TEXT,
            test_type TEXT,
            correct_answers INTEGER,
            incorrect_answers INTEGER,
            correct_percentage REAL
        )`);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public', '50bb');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        res.json(files);
    });
});

app.get('/api/eq-images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public', 'eq');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        res.json(files);
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }
        res.status(200).json({ success: true });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Login failed' });
        }

        if (row && bcrypt.compareSync(password, row.password)) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});

app.post('/record-session', (req, res) => {
    const { username, test_type, correct_answers, incorrect_answers } = req.body;
    const login_date = new Date().toISOString();
    const correct_percentage = (correct_answers / (correct_answers + incorrect_answers)) * 100;

    db.run("INSERT INTO sessions (username, login_date, test_type, correct_answers, incorrect_answers, correct_percentage) VALUES (?, ?, ?, ?, ?, ?)",
        [username, login_date, test_type, correct_answers, incorrect_answers, correct_percentage], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to record session' });
        }
        res.status(200).json({ success: true });
    });
});

if (useSsl) {
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };

    https.createServer(options, app).listen(sslPort, () => {
        console.log(`HTTPS Server running at https://localhost:${sslPort}`);
    });
} else {
    http.createServer(app).listen(port, () => {
        console.log(`HTTP Server running at http://localhost:${port}`);
    });
}
