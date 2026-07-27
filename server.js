const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('OmniStream 4K Engine Active!');
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL is required');
    }

    try {
        // Cobalt public API for instant anti-bot video extraction
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                videoQuality: quality === '2160' ? 'max' : quality,
                downloadMode: quality === 'mp3' ? 'audio' : 'auto'
            })
        });

        const data = await response.json();

        // Redirect to direct clean video stream
        if (data.url) {
            return res.redirect(data.url);
        } else if (data.picker && data.picker.length > 0) {
            return res.redirect(data.picker[0].url);
        } else {
            return res.status(500).send('Video stream not found or link private.');
        }

    } catch (err) {
        console.error('Fetch error:', err);
        return res.status(500).send('API Processing Error');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
