const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('OmniStream Engine Online');
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.quality || '1080';

    if (!videoUrl) {
        return res.status(400).send('Video URL parameter missing!');
    }

    try {
        // Primary Processing via Cobalt API Engine
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                url: videoUrl,
                videoQuality: quality === '2160' ? 'max' : quality,
                downloadMode: quality === 'mp3' ? 'audio' : 'auto'
            })
        });

        const data = await response.json();

        // Redirect directly to high speed downloadable stream
        if (data.url) {
            return res.redirect(data.url);
        } else if (data.picker && data.picker.length > 0) {
            return res.redirect(data.picker[0].url);
        } else if (data.status === 'tunnel' || data.status === 'redirect') {
            return res.redirect(data.url);
        } else {
            // Secondary Fallback Engine if Cobalt returns stream error
            const fallbackUrl = `https://loader.to/api/ajax/getdata?format=${quality === 'mp3' ? 'mp3' : quality}&url=${encodeURIComponent(videoUrl)}`;
            return res.redirect(fallbackUrl);
        }

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).send('Server Error. Please try a public video link.');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
