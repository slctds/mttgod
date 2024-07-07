require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

console.log('PORT:', process.env.PORT);
console.log('SSL_PORT:', process.env.SSL_PORT);
console.log('USE_SSL:', process.env.USE_SSL);

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
        db.run(`CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            correct_answers INTEGER,
            incorrect_answers INTEGER,
            score REAL,
            timestamp TEXT
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
            console.error('Failed to read directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        console.log('Files in 50bb directory:', files);
        res.json(files);
    });
});

app.get('/api/eq-images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public', 'eq');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.error('Failed to read directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        console.log('Files in eq directory:', files);
        res.json(files);
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (row) {
            console.log('Username already exists:', username);
            return res.status(400).json({ success: false, message: 'Username already exists' });
        } else {
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ success: false, message: 'Registration failed' });
                }
                console.log('User registered successfully:', username);
                res.status(200).json({ success: true });
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: 'Login failed' });
        }

        if (row && bcrypt.compareSync(password, row.password)) {
            console.log('Login successful for username:', username);
            res.status(200).json({ success: true });
        } else {
            console.log('Invalid username or password for username:', username);
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
            console.error('Failed to record session:', err);
            return res.status(500).json({ success: false, message: 'Failed to record session' });
        }
        res.status(200).json({ success: true });
    });
});

app.post('/api/record-test', (req, res) => {
    const { username, correctAnswers, incorrectAnswers } = req.body;
    const totalQuestions = correctAnswers + incorrectAnswers;
    const score = (totalQuestions > 0) ? (correctAnswers / totalQuestions) * 100 : 0;
    const timestamp = new Date().toISOString();

    const query = `INSERT INTO test_results (username, correct_answers, incorrect_answers, score, timestamp) VALUES (?, ?, ?, ?, ?)`;
    const params = [username, correctAnswers, incorrectAnswers, score, timestamp];

    db.run(query, params, function(err) {
        if (err) {
            console.error('Failed to record test results:', err);
            return res.status(500).json({ success: false, message: 'Failed to record test results' });
        }
        res.json({ success: true });
    });
});

app.get('/api/stats', (req, res) => {
    const username = req.query.username;

    const query = `
        SELECT
            DATE(timestamp) as date,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ?
        GROUP BY DATE(timestamp)
        UNION ALL
        SELECT
            'Всего' as date,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ?`;

    db.all(query, [username, username], (err, rows) => {
        if (err) {
            console.error('Failed to get stats:', err);
            return res.status(500).json({ success: false, message: 'Failed to get stats' });
        }

        res.json({
            success: true,
            stats: rows
        });
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

