const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
