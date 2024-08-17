const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');

require('dotenv').config();

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
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Пути к Excel-файлам
const handsFilePath = path.join(__dirname, 'public', 'byhands', 'hands', 'hands2.xlsx');
const procentFilePath = path.join(__dirname, 'public', 'byhands', 'hands', 'procent50.xlsx');

// Указываем путь к единой базе данных
const dbPath = path.join(__dirname, 'database.db');

// Инициализация базы данных
const db = new sqlite3.Database(dbPath, (err) => {
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
            test_name TEXT,
            correct_answers INTEGER,
            incorrect_answers INTEGER,
            timestamp TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS testhands (
            id INTEGER PRIMARY KEY,
            hand TEXT,
            procent INTEGER,
            wrong INTEGER DEFAULT 0
        )`);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Функция для проверки и заполнения таблицы testhands
async function checkAndFillTestHandsTable() {
    const db = new sqlite3.Database(dbPath);

    // Проверка количества записей в таблице testhands
    let handsCount = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM testhands WHERE hand IS NOT NULL`, (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
        });
    });

    if (handsCount < 169) {
        // Если количество записей меньше 169, очищаем и заполняем колонку hand
        console.log("Заполнение колонки hand данными из hands2.xlsx");

        const workbook = xlsx.readFile(handsFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const handsData = xlsx.utils.sheet_to_json(sheet, { header: 1 }).flat();

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`DELETE FROM testhands`); // Полностью очищаем таблицу
                const insertStmt = db.prepare(`INSERT INTO testhands (hand) VALUES (?)`);
                handsData.forEach((hand) => {
                    insertStmt.run(hand);
                });
                insertStmt.finalize(resolve);
            });
        });

        console.log("Колонка hand успешно заполнена");
    }

    // Проверка количества записей в колонке procent
    let procentCount = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM testhands WHERE procent IS NOT NULL`, (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
        });
    });

    if (procentCount < 169) {
        // Если количество записей меньше 169, очищаем и заполняем колонку procent
        console.log("Заполнение колонки procent данными из procent50.xlsx");

        const workbook = xlsx.readFile(procentFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const procentData = xlsx.utils.sheet_to_json(sheet, { header: 1 }).flat();

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                const updateStmt = db.prepare(`UPDATE testhands SET procent = ? WHERE id = ?`);
                procentData.forEach((procent, index) => {
                    updateStmt.run(procent, index + 1);
                });
                updateStmt.finalize(resolve);
            });
        });

        console.log("Колонка procent успешно заполнена");
    }

    db.close();
}

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

app.get('/api/eqtest-files', (req, res) => {
    const eqtestDirectory = path.join(__dirname, 'public', 'eqtest');
    fs.readdir(eqtestDirectory, (err, files) => {
        if (err) {
            console.error('Failed to read directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        console.log('Files in eqtest directory:', files); // Логгирование текущей папки и файлов
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
    const { username, testName, correctAnswers, incorrectAnswers } = req.body;
    const timestamp = new Date().toISOString();

    const query = `INSERT INTO test_results (username, test_name, correct_answers, incorrect_answers, timestamp) VALUES (?, ?, ?, ?, ?)`;
    const params = [username, testName, correctAnswers, incorrectAnswers, timestamp];

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
            'DP' as category,
            'Всего' as test_name,
            COALESCE(SUM(correct_answers + incorrect_answers), 0) as totalAnswers,
            COALESCE(SUM(correct_answers), 0) as correctAnswers,
            COALESCE((SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)), 0) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'DP%'
        UNION ALL
        SELECT
            'EQ' as category,
            'Всего' as test_name,
            COALESCE(SUM(correct_answers + incorrect_answers), 0) as totalAnswers,
            COALESCE(SUM(correct_answers), 0) as correctAnswers,
            COALESCE((SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)), 0) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'EQ%'
        UNION ALL
        SELECT
            'HH' as category,
            'Всего' as test_name,
            COALESCE(SUM(correct_answers + incorrect_answers), 0) as totalAnswers,
            COALESCE(SUM(correct_answers), 0) as correctAnswers,
            COALESCE((SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)), 0) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'HH%'
    `;

    db.all(query, [username, username, username], (err, rows) => {
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


// Конечная точка для получения статистики EQ
app.get('/api/stats/eq', (req, res) => {
    const username = req.query.username;

    const query = `
        SELECT
            test_name,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'EQ%'
        GROUP BY test_name
    `;

    db.all(query, [username], (err, rows) => {
        if (err) {
            console.error('Не удалось получить statsEQ:', err);
            return res.status(500).json({ success: false, message: 'Не удалось получить statsEQ' });
        }

        res.json({
            success: true,
            stats: rows
        });
    });
});

// Конечная точка для получения статистики DP
app.get('/api/stats/dp', (req, res) => {
    const username = req.query.username;

    const query = `
        SELECT
            test_name,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'DP%'
        GROUP BY test_name
    `;

    db.all(query, [username], (err, rows) => {
        if (err) {
            console.error('Не удалось получить statsDP:', err);
            return res.status(500).json({ success: false, message: 'Не удалось получить statsDP' });
        }

        res.json({
            success: true,
            stats: rows
        });
    });
});

// Конечная точка для получения статистики HH
app.get('/api/stats/hh', (req, res) => {
    const username = req.query.username;

    const query = `
        SELECT
            'HH' as category,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ? AND test_name LIKE 'HH%'
    `;

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Не удалось получить statsHH:', err);
            return res.status(500).json({ success: false, message: 'Не удалось получить statsHH' });
        }

        console.log('Data for HH:', row);

        res.json({
            success: true,
            stats: row
        });
    });
});



app.post('/api/check-or-create-test', (req, res) => {
    const { username, testType } = req.body;
    const today = new Date().toISOString().split('T')[0];

    db.get('SELECT * FROM sessions WHERE username = ? AND login_date = ? AND test_type = ?', [username, today, testType], (err, row) => {
        if (err) {
            console.error('Error checking test record:', err);
            return res.status(500).json({ success: false });
        }

        if (!row) {
            db.run('INSERT INTO sessions (username, login_date, test_type, correct_answers, incorrect_answers) VALUES (?, ?, ?, 0, 0)', [username, today, testType], function(err) {
                if (err) {
                    console.error('Error creating test record:', err);
                    return res.status(500).json({ success: false });
                }
                res.status(200).json({ success: true });
            });
        } else {
            res.status(200).json({ success: true });
        }
    });
});

app.get('/api/get-random-hand', (req, res) => {
    const handsFile = path.join(__dirname, 'public', 'eqtest', 'hands.xlsx');
    const workbook = xlsx.readFile(handsFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = xlsx.utils.decode_range(sheet['!ref']);
    
    const randomRow = Math.floor(Math.random() * (range.e.r + 1));
    const randomCol = Math.floor(Math.random() * (range.e.c + 1));
    const cellAddress = xlsx.utils.encode_cell({ c: randomCol, r: randomRow });
    const randomHand = sheet[cellAddress]?.v || 'Unknown';

    res.json({ hand: randomHand, cell: cellAddress });
});

app.post('/api/check-answer', (req, res) => {
    const { hand, range, selectedAnswer, cell } = req.body;
    const filePath = path.join(__dirname, 'public', 'eqtest', `${range}.xlsx`);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const correctEquity = sheet[cell]?.v || 0;

    const isCorrect = selectedAnswer === "0-50" ? correctEquity <= 50 : correctEquity > 50;

    console.log(`Correct equity: ${correctEquity}`); // Вывод правильного ответа в терминал

    res.json({ correct: isCorrect, correctAnswer: correctEquity });
});

app.post('/api/update-test-record', (req, res) => {
    const { username, testType, isCorrect } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const field = isCorrect ? 'correct_answers' : 'incorrect_answers';
    const query = `UPDATE sessions SET ${field} = ${field} + 1 WHERE username = ? AND login_date = ? AND test_type = ?`;

    db.run(query, [username, today, testType], function(err) {
        if (err) {
            console.error('Error updating test record:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.get('/api/stats/details', (req, res) => {
    const { username, testName } = req.query;

    const query = `
        SELECT
            DATE(timestamp) as date,
            test_name,
            SUM(correct_answers + incorrect_answers) as totalAnswers,
            SUM(correct_answers) as correctAnswers,
            (SUM(correct_answers) * 100.0 / SUM(correct_answers + incorrect_answers)) as percentage
        FROM test_results
        WHERE username = ? AND test_name = ?
        GROUP BY DATE(timestamp), test_name
    `;

    db.all(query, [username, testName], (err, rows) => {
        if (err) {
            console.error('Failed to get detailed stats:', err);
            return res.status(500).json({ success: false, message: 'Failed to get detailed stats' });
        }

        res.json({
            success: true,
            stats: rows
        });
    });
});

// Функция для получения данных hands и procent
function fetchAllHandsAndProcent() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.all(`SELECT hand, procent FROM testhands`, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const hands = rows.map(row => row.hand);
                const procentValues = rows.map(row => row.procent);
                resolve({ hands, procentValues });
            }
        });
    });
}

// Обновленный маршрут для начала теста "По рукам"
app.post('/api/byhands/start-test', async (req, res) => {
    console.log('Получен запрос на старт теста');
    try {
        // Проверка и заполнение таблицы testhands
        await checkAndFillTestHandsTable();

        // Запрос всех данных из таблицы testhands
        const { hands, procentValues } = await fetchAllHandsAndProcent();

        if (hands.length === 0) {
            console.log('Нет доступных вопросов.');
            return res.json({ success: false, message: 'Нет доступных вопросов.' });
        }

        const randomIndex = Math.floor(Math.random() * hands.length);
        const hand = hands[randomIndex];
        const correctValue = procentValues[randomIndex];

        console.log('Выбранная рука и правильное значение:', hand, correctValue);

        res.json({
            success: true,
            hand,
            correctValue,
            procentValues,
            hands
        });
    } catch (error) {
        console.error('Ошибка при получении hands и procent:', error);
        res.json({ success: false });
    }
});

app.post('/api/save-test-results', (req, res) => {
    const { username, correct_answers, incorrect_answers, timestamp, test_name } = req.body;  // Проверка на корректные имена полей
    const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

    db.run(
        `INSERT INTO test_results (username, correct_answers, incorrect_answers, timestamp, test_name) VALUES (?, ?, ?, ?, ?)`,
        [username, correct_answers, incorrect_answers, timestamp, test_name],  // Использование правильных полей
        function (err) {
            if (err) {
                console.error('Ошибка при сохранении результатов теста:', err.message);
                res.json({ success: false, message: 'Ошибка при сохранении результатов' });
            } else {
                console.log('Результаты теста успешно сохранены');
                res.json({ success: true });
            }
        }
    );

    db.close();
});



// Новый маршрут для сохранения неверных ответов
app.post('/api/byhands/save-incorrect-hands', async (req, res) => {
    const incorrectAnswers = req.body.incorrectAnswers;

    try {
        for (const hand of incorrectAnswers) {
            await new Promise((resolve, reject) => {
                db.get(`SELECT wrong FROM testhands WHERE hand = ?`, [hand], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        let newWrongValue = 1;
                        if (row && row.wrong) {
                            newWrongValue = row.wrong + 1;
                        }

                        db.run(`UPDATE testhands SET wrong = ? WHERE hand = ?`, [newWrongValue, hand], (updateErr) => {
                            if (updateErr) {
                                reject(updateErr);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка при обновлении значений wrong:', err);
        res.json({ success: false });
    }
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
};
