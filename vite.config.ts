import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { YoutubeTranscript } from 'youtube-transcript'

// Custom Vite plugin to act as a backend for transcript extraction
const youtubeTranscriptPlugin = () => {
  return {
    name: 'youtube-transcript-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/transcript')) {
          try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const videoUrl = urlObj.searchParams.get('url');
            
            if (!videoUrl) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing url parameter' }));
            }

            let transcriptArray;
            try {
              transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl);
            } catch (err) {
              console.log("[YoutubeTranscript Fallback] Attempting manual extraction for:", videoUrl);
              const response = await fetch(videoUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                  'Cookie': 'CONSENT=YES+cb'
                }
              });
              const html = await response.text();
              const splittedHTML = html.split('"captions":');
              if (splittedHTML.length <= 1) {
                console.error("[YoutubeTranscript] Transcript disabled or not found for:", videoUrl);
                throw new Error("El video no tiene subtítulos o fue bloqueado por YouTube.");
              }
              const captionsJson = splittedHTML[1].split(',"videoDetails')[0].replace(/\n/g, '');
              const captions = JSON.parse(captionsJson);
              const captionTracks = captions?.playerCaptionsTracklistRenderer?.captionTracks;
              
              if (!captionTracks || !captionTracks.length) {
                console.error("[YoutubeTranscript] Transcript disabled or not found for:", videoUrl);
                throw new Error("No hay pistas de subtítulos disponibles.");
              }
              
              // Intentar buscar los subtítulos en español primero, si no, el primero
              const esTrack = captionTracks.find(track => track.languageCode === 'es' || track.languageCode === 'es-419');
              const trackToUse = esTrack || captionTracks[0];
              
              const transcriptUrl = trackToUse.baseUrl;
              const transcriptResponse = await fetch(transcriptUrl);
              const transcriptXml = await transcriptResponse.text();
              
              const matches = [...transcriptXml.matchAll(/<text start="([^"]*)" dur="([^"]*)".*?>(.*?)<\/text>/g)];
              transcriptArray = matches.map(m => ({
                offset: parseFloat(m[1]) * 1000,
                duration: parseFloat(m[2]) * 1000,
                text: m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
              }));
              
              if (!transcriptArray.length) {
                console.error("[YoutubeTranscript] Transcript disabled or not found for:", videoUrl);
                throw err;
              }
            }
            
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
          } catch (error) {
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
  plugins: [react(), youtubeTranscriptPlugin()],
})
