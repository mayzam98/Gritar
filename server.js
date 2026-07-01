import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import cors from 'cors';
import puppeteer from 'puppeteer';

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
      console.warn("Primary extractor failed, using Puppeteer Browser Simulation:", primaryError.message);
      
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await page.content();
        
        // Scraping the title
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(' - YouTube', '').trim();
        }

        const match = html.match(/"captionTracks":\s*(\[.*?\])/);
        if (!match) throw new Error('Transcript is disabled or not found on this video');
        
        const tracks = JSON.parse(match[1]);
        const track = tracks.find(t => t.languageCode === 'es') || tracks.find(t => t.languageCode === 'en') || tracks[0];
        
        const json = await page.evaluate(async (url) => {
          const r = await fetch(url + '&fmt=json3');
          if (!r.ok) throw new Error('Failed to fetch from internal YouTube API');
          return await r.json();
        }, track.baseUrl);
        
        if (!json || !json.events) throw new Error('Failed to parse subtitle events');
        
        formattedText = json.events.map(ev => {
          if (!ev.segs) return null;
          return `[${Math.floor(ev.tStartMs/1000)}] ` + ev.segs.map(s => s.utf8).join('');
        }).filter(Boolean).join('\n');
        
      } catch (puppeteerError) {
        console.error("Puppeteer simulation failed:", puppeteerError);
        throw new Error("El VPS está bloqueado y la simulación del navegador falló. Verifica las dependencias de Chromium en el servidor.");
      } finally {
        if (browser) await browser.close();
      }
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
