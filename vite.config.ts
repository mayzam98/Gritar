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

            const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl);
            
            // Format the transcript to include timestamps so the AI knows exactly when things happen
            // Example: [12] Hola a todos
            const formattedText = transcriptArray.map(t => "[" + Math.floor(t.offset / 1000) + "] " + t.text).join("\n");
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: formattedText }));
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
