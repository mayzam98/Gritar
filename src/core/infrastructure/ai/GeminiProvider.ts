import type { AiProvider, AiAnalysisResult } from '../../domain/AiProvider';

export class GeminiProvider implements AiProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeTutorial(transcript: string): Promise<AiAnalysisResult> {
    const prompt = `
      Asume la identidad de un MAESTRO EN TEORÍA MUSICAL y un transcriptor de guitarra súper profesional.
      Tu capacidad analítica es hiper-precisa. Tu trabajo es diseccionar esta transcripción de un tutorial de guitarra.
      Las líneas de la transcripción comienzan con un [segundo] (ej. [45] significa 45 segundos).
      
      REGLAS ESTRICTAS DE EXTRACCIÓN:
      1. Extrae TODOS los acordes mencionados (principales, de paso, adornos, bajos). NO omitas absolutamente nada.
      2. El arreglo "chords" DEBE SER LA PROGRESIÓN EXACTA Y CRONOLÓGICA de los acordes en el orden en que se enseñan o tocan en la canción.
      3. Puedes REPETIR acordes en el arreglo "chords" si la canción vuelve a ellos (ej. ["Em", "C", "G", "D", "Em", "C"]). ¡Es una progresión real!
      4. En "chordTimestamps", incluye el segundo exacto donde el profesor menciona o toca cada acorde por primera vez.
      5. En "chordDetails", deduce CÓMO EL PROFESOR TOCA EL ACORDE TENIENDO EN CUENTA TODO EL CONTEXTO DEL VIDEO (traste inicial y posición de dedos). Mapea los dedos a trastes y cuerdas (string 1 es la más aguda, 6 la más grave. finger 1 es índice, 2 medio, 3 anular, 4 meñique).
      6. Tu resumen debe ser una clase magistral: explica la progresión, técnicas, capo, y dinámica.
      7. RESPONDE 100% EN ESPAÑOL.
      
      Devuelve ÚNICAMENTE un objeto JSON con este formato exacto (sin markdown, sin comillas invertidas, solo JSON puro):
      {
        "chords": ["Em", "C", "G"],
        "chordTimestamps": [
          { "chord": "Em", "timeSeconds": 45 }
        ],
        "chordDetails": [
          {
            "chord": "Em",
            "startFret": 1,
            "positions": [
              { "string": 5, "fret": 2, "finger": 2 },
              { "string": 4, "fret": 2, "finger": 3 }
            ]
          }
        ],
        "strumming": "Abajo, Abajo...",
        "summary": ["Punto 1..."]
      }
      
      Extrae el momento donde el instructor explica o toca por primera vez cada acorde para el arreglo chordTimestamps.
      
      Transcripción:
      ${transcript}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResult = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(textResult);

    return {
      chords: result.chords || [],
      chordTimestamps: result.chordTimestamps || [],
      strumming: result.strumming || 'No especificado',
      summary: result.summary || []
    };
  }
}
