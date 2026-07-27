const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('OmniStream 4K Engine Active!');
});

app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL is required');
    }

    const timestamp = Date.now();
    const tempFilePath = path.join(__dirname, `video_${timestamp}.mp4`);

    // Flexible format selector: tries requested quality first, then falls back to best single file
    let format = `best[height<=${quality}]/bestvideo[height<=${quality}]+bestaudio/best`;
    if (quality === 'mp3') {
        format = 'bestaudio/best';
    }

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // Added --no-check-certificate and --force-overwrites to prevent command locks
    const command = `yt-dlp --no-check-certificate --user-agent "${userAgent}" -f "${format}" -o "${tempFilePath}" "${videoUrl}"`;

    console.log(`Executing: ${command}`);

    exec(command, { maxBuffer: 1024 * 1024 * 1000 }, (error, stdout, stderr) => {
        // Log details to Render logs for debugging
        if (stderr) console.log(`yt-dlp stderr: ${stderr}`);

        // Check if file was actually downloaded despite minor warnings
        if (fs.existsSync(tempFilePath)) {
            return res.download(tempFilePath, `video_${quality}p.mp4`, (err) => {
                if (err) console.error(`Send error: ${err}`);
                fs.unlink(tempFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error(`Cleanup error: ${unlinkErr}`);
                });
            });
        }

        // If file was not created, return error
        console.error(`yt-dlp exec error: ${error ? error.message : 'File not found'}`);
        return res.status(500).send('Unable to download video. Please check the URL or try again.');
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
