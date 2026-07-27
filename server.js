const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());

// Health Check Route
app.get('/', (req, res) => {
    res.send('OmniStream 4K Backend Server Active!');
});

// Download API Route
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL missing');
    }

    res.header('Content-Type', 'video/mp4');
    res.header('Content-Disposition', `attachment; filename="video_${quality}p.mp4"`);

    let format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
    if (quality === 'mp3') {
        format = 'bestaudio/best';
    }

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
    const command = `yt-dlp --user-agent "${userAgent}" -f "${format}" -o - "${videoUrl}"`;

    const child = exec(command, { maxBuffer: 1024 * 1024 * 1000 });

    child.stdout.pipe(res);

    child.stderr.on('data', (data) => console.log(`yt-dlp log: ${data}`));
    child.on('error', (err) => {
        console.error('Execution Error:', err);
        if (!res.headersSent) res.status(500).send('Download Error');
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
