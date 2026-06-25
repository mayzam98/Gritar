import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/transcript', async (req, res) => {
  const videoUrl = req.query.url;
  
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl);
    
    // Format the transcript to include timestamps
    const formattedText = transcriptArray.map(t => "[" + Math.floor(t.offset / 1000) + "] " + t.text).join("\n");
    
    // Fetch video title by scraping the HTML
    let title = 'Tutorial Guardado';
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
    
    res.json({ text: formattedText, title: title });
  } catch (error) {
    console.error("Transcript error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
