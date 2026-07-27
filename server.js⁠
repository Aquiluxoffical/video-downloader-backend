const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());

app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL zaroori hai');
    }

    res.header('Content-Disposition', `attachment; filename="video_${quality}p.mp4"`);

    let format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
    if (quality === 'mp3') {
        format = 'bestaudio/best';
    }

    const command = `yt-dlp -f "${format}" -o - "${videoUrl}"`;
    const child = exec(command, { maxBuffer: 1024 * 1024 * 1000 });

    child.stdout.pipe(res);

    child.stderr.on('data', (data) => console.log(`yt-dlp: ${data}`));
    child.on('error', (err) => {
        console.error('Download Error:', err);
        if (!res.headersSent) res.status(500).send('Download Process Fail Ho Gaya');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
