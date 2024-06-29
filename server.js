require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;
const sslPort = process.env.SSL_PORT || 3443;
const useSsl = process.env.USE_SSL === 'true';

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Обработчик для корневого URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public/50bb');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        res.json(files);
    });
});

if (useSsl) {
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || 'path/to/your/ssl/key.pem'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'path/to/your/ssl/cert.pem')
    };

    https.createServer(options, app).listen(sslPort, () => {
        console.log(`HTTPS Server running at https://localhost:${sslPort}`);
    });
} else {
    http.createServer(app).listen(port, () => {
        console.log(`HTTP Server running at http://localhost:${port}`);
    });
}
