import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';

const app = express();
app.use(cors());

app.get('/api/transcript', async (req, res) => {
  const videoUrl = req.query.url;
  
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const customFetch = (url, options) => {
      options = options || {};
      options.headers = {
        ...options.headers,
        'Cookie': 'SOCS=CAI',
        'Accept-Language': 'es,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
      return fetch(url, options);
    };

    let formattedText;
    let title = 'Tutorial Guardado';

    try {
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl, { fetch: customFetch });
      formattedText = transcriptArray.map(t => "[" + Math.floor(t.offset / 1000) + "] " + t.text).join("\n");
      
      // Fetch video title by scraping the HTML
      try {
        const htmlResponse = await fetch(videoUrl);
        const htmlText = await htmlResponse.text();
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(' - YouTube', '').trim();
        }
      } catch (e) {
        console.error("Could not fetch title", e);
      }
    } catch (primaryError) {
      console.warn("Primary extractor failed, using yt-dlp fallback:", primaryError.message);
      const output = await youtubedl(videoUrl, {
        dumpJson: true,
        skipDownload: true,
        writeAutoSub: true,
        writeSub: true
      });
      
      let subs = output.subtitles;
      if (!subs || Object.keys(subs).length === 0) subs = output.automatic_captions;
      if (!subs || Object.keys(subs).length === 0) throw new Error('Transcript is disabled on this video');
      
      const esSubs = subs['es'] || subs['en'] || Object.values(subs)[0];
      const bestSub = esSubs.find(s => s.ext === 'json3');
      if (!bestSub) throw new Error('Transcript format not supported');
      
      const res = await fetch(bestSub.url);
      const data = await res.json();
      formattedText = data.events.map(ev => {
        if (!ev.segs) return null;
        return `[${Math.floor(ev.tStartMs/1000)}] ` + ev.segs.map(s => s.utf8).join('');
      }).filter(Boolean).join('\n');
      
      title = output.title || title;
    }
    
    res.json({ text: formattedText, title: title });
  } catch (error) {
    if (error.message && error.message.includes('Transcript is disabled')) {
      console.warn(`[YoutubeTranscript] Transcript disabled or not found for: ${videoUrl}`);
      return res.status(404).json({ error: 'Transcript is disabled on this video' });
    }
    console.error("Transcript error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
