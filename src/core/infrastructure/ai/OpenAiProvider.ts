import type { AiProvider, AiAnalysisResult } from '../../domain/AiProvider';

export class OpenAiProvider implements AiProvider {
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
      5. En "chordDetails", deduce CÓMO EL PROFESOR TOCA EL ACORDE (traste inicial y posición de dedos). Mapea los dedos a trastes y cuerdas (string 1 es la más aguda, 6 la más grave. finger 1 es índice, 2 medio, 3 anular, 4 meñique).
      6. Tu resumen debe ser una clase magistral: explica la progresión, técnicas, capo, y dinámica.
      7. RESPONDE 100% EN ESPAÑOL.
      
      Devuelve ÚNICAMENTE un objeto JSON con este formato exacto:
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      chords: result.chords || [],
      chordTimestamps: result.chordTimestamps || [],
      strumming: result.strumming || 'No especificado',
      summary: result.summary || []
    };
  }
}
