const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('OmniStream 4K Engine Ready');
});

app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL is required');
    }

    // Unique temp file path generate karein
    const timestamp = Date.now();
    const tempFilePath = path.join(__dirname, `video_${timestamp}.mp4`);

    // Quality/Format rules
    let format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
    if (quality === 'mp3') {
        format = 'bestaudio/best';
    }

    // High quality User-Agent to bypass Anti-Bot blocking
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Command: Pehle complete file server par download hoti hai
    const command = `yt-dlp --user-agent "${userAgent}" --no-playlist -f "${format}" -o "${tempFilePath}" "${videoUrl}"`;

    console.log(`Processing URL: ${videoUrl} with quality ${quality}p`);

    exec(command, { maxBuffer: 1024 * 1024 * 1000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`yt-dlp error: ${error.message}`);
            return res.status(500).send('Failed to process video on server.');
        }

        // File download hone ke baad Browser ko send karein
        res.download(tempFilePath, `video_${quality}p.mp4`, (err) => {
            if (err) {
                console.error(`Send error: ${err}`);
            }
            // Send karne ke baad temporary file delete kar dein
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error(`Unlink error: ${unlinkErr}`);
            });
        });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
