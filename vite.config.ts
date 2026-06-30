import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { YoutubeTranscript } from 'youtube-transcript'

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

            const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl, { fetch: customFetch });
            
            // Format the transcript to include timestamps so the AI knows exactly when things happen
            // Example: [12] Hola a todos
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
