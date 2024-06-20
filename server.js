const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const port = 3000;
const sslPort = 3443;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/pokertest.online/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/pokertest.online/fullchain.pem')
};

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public/50bb');
    console.log(`Reading directory: ${imagesDirectory}`); // Добавим логирование пути к директории

    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.error(`Failed to read directory: ${err.message}`); // Добавим логирование ошибки
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        res.json(files);
    });
});

http.createServer(app).listen(port, () => {
    console.log(`HTTP Server running at http://localhost:${port}`);
});

https.createServer(options, app).listen(sslPort, () => {
    console.log(`HTTPS Server running at https://localhost:${sslPort}`);
});
