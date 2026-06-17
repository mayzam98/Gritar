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
      
      REGLAS DE ANÁLISIS MUSICAL PROFUNDO:
      1. ANÁLISIS ANALÍTICO DEL TEXTO: El profesor a menudo no dirá el nombre del acorde de forma directa. Debes buscar y traducir pistas en su forma de hablar:
         - Movimientos relativos: "bajamos un tono", "subimos la figura al traste 3", "pasamos a la quinta".
         - Pistas líricas: "Cuando canto la parte de 'Vámonos'...", asocia el cambio de acorde a ese segundo.
         - Posiciones físicas: Si dice "dedo 1 en cuerda 2 traste 1, dedo 2 en cuerda 4 traste 2...", deduce que es un Do mayor (C) aunque no lo nombre.
      2. Extrae TODOS los acordes mencionados, deducidos de las posiciones, o inferidos lógicamente. NO omitas nada.
      3. El arreglo "chords" DEBE SER LA PROGRESIÓN EXACTA Y CRONOLÓGICA de los acordes.
      3. Puedes REPETIR acordes en el arreglo "chords" si la canción vuelve a ellos (ej. ["Em", "C", "G", "D", "Em", "C"]). ¡Es una progresión real!
      4. En "chordTimestamps", DEBES crear la línea de tiempo COMPLETA de la canción. Registra CADA VEZ que haya un cambio de acorde en el video. Para ahorrar tokens, usa un formato de arreglo compacto [segundo, "Acorde"]. Ej: [[10, "F"], [14, "G"], [18, "F"]].
      5. En "chordDetails", deduce CÓMO EL PROFESOR TOCA EL ACORDE TENIENDO EN CUENTA TODO EL CONTEXTO DEL VIDEO (traste inicial y posición de dedos). Mapea los dedos a trastes y cuerdas (string 1 es la más aguda, 6 la más grave. finger 1 es índice, 2 medio, 3 anular, 4 meñique).
      6. Tu resumen debe ser una clase magistral: explica la progresión, técnicas, capo, y dinámica.
      7. RESPONDE 100% EN ESPAÑOL.
      8. REGLA DE ORO: ¡Tú no tienes ojos, solo lees texto! Si el profesor no menciona un acorde explícitamente pero por la letra de la canción o tu conocimiento musical sabes perfectamente qué acorde va ahí (ej. si es 'Vámonos a Marte' y sabes que lleva un C), INFIÉRELO e inclúyelo. Complétalo con tu sabiduría musical.
      
      Devuelve ÚNICAMENTE un objeto JSON con este formato exacto (sin markdown, sin comillas invertidas, solo JSON puro):
      {
        "chords": ["Em", "C", "G"],
        "chordTimestamps": [
          [45, "Em"],
          [48, "C"]
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
      
      Extrae TODOS los momentos donde haya un cambio de acorde para poblar la línea de tiempo cronológica completa en chordTimestamps.
      
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
    const cleanJson = textResult.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    let result;
    try {
      result = JSON.parse(cleanJson);
    } catch (error) {
      throw new Error("El modelo generó demasiados datos y cortó la respuesta (Límite de tokens). Intenta con un video más corto.");
    }

    // Map compact [time, chord] back to the required object interface
    const mappedTimestamps = (result.chordTimestamps || []).map((t: any) => {
      if (Array.isArray(t) && t.length >= 2) {
        return { timeSeconds: t[0], chord: t[1] };
      }
      return t;
    });

    return {
      chords: result.chords || [],
      chordTimestamps: mappedTimestamps,
      chordDetails: result.chordDetails || [],
      strumming: result.strumming || 'No especificado',
      summary: result.summary || []
    };
  }
}
