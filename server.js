import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.get('/api/transcript', (req, res) => {
  const videoUrl = req.query.url;
  
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const pythonScriptPath = path.join(__dirname, 'get_transcript.py');
  
  // Ejecutamos el script de Python pasando la URL como argumento
  exec(`python "${pythonScriptPath}" "${videoUrl}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing python script: ${error.message}`);
      // Fallback intentando con python3 por si acaso en Linux/VPS
      exec(`python3 "${pythonScriptPath}" "${videoUrl}"`, (err3, stdout3, stderr3) => {
         if (err3) {
            console.error(`Error with python3: ${err3.message}`);
            return res.status(500).json({ error: "Failed to extract transcript using Python." });
         }
         processOutput(stdout3, res);
      });
      return;
    }
    
    processOutput(stdout, res);
  });
});

function processOutput(stdout, res) {
    try {
      const data = JSON.parse(stdout);
      if (data.error) {
        if (data.error.includes("Subtitles are disabled")) {
           return res.status(404).json({ error: 'Transcript is disabled on this video' });
        }
        return res.status(500).json({ error: data.error });
      }
      res.json({ text: data.text, title: data.title });
    } catch (parseError) {
      console.error("Error parsing python output:", parseError);
      console.error("Raw output:", stdout);
      res.status(500).json({ error: "Invalid response from extraction script." });
    }
}


const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
