import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { YoutubeTranscript } from 'youtube-transcript'
import puppeteer from 'puppeteer'

// Custom Vite plugin to act as a backend for transcript extraction
const youtubeTranscriptPlugin = () => {
  return {
    name: 'youtube-transcript-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/transcript')) {
          try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const videoUrl = urlObj.searchParams.get('url');
            
            if (!videoUrl) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing url parameter' }));
            }

            const customFetch = (url: any, options: any) => {
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
            } catch (primaryError: any) {
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
                const track = tracks.find((t: any) => t.languageCode === 'es') || tracks.find((t: any) => t.languageCode === 'en') || tracks[0];
                
                const json = await page.evaluate(async (url) => {
                  const r = await fetch(url + '&fmt=json3');
                  if (!r.ok) throw new Error('Failed to fetch from internal YouTube API');
                  return await r.json();
                }, track.baseUrl) as any;
                
                if (!json || !json.events) throw new Error('Failed to parse subtitle events');
                
                formattedText = json.events.map((ev: any) => {
                  if (!ev.segs) return null;
                  return `[${Math.floor(ev.tStartMs/1000)}] ` + ev.segs.map((s: any) => s.utf8).join('');
                }).filter(Boolean).join('\n');
                
              } catch (puppeteerError) {
                console.error("Puppeteer simulation failed:", puppeteerError);
                throw new Error("El VPS está bloqueado y la simulación del navegador falló. Verifica las dependencias de Chromium en el servidor.");
              } finally {
                if (browser) await browser.close();
              }
            }
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: formattedText, title: title }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        } else {
          next();
        }
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), youtubeTranscriptPlugin()],
})
