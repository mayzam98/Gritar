export class YouTubeTranscriptService {
  /**
   * Fetches the transcript of a YouTube video using our custom Vite backend plugin.
   */
  static async getTranscript(youtubeUrl: string): Promise<{text: string, title: string}> {
    try {
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(youtubeUrl)}`);
      
      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        if (textResponse.trim().toLowerCase().startsWith('<!doctype') || textResponse.trim().toLowerCase().startsWith('<html')) {
          throw new Error("El servicio de transcripción requiere un servidor backend (no disponible en la versión estática).");
        }
        throw new Error("Error al leer la respuesta de subtítulos.");
      }
      
      if (!response.ok) {
        throw new Error(data.error || "No se pudo conectar a YouTube a través del servidor local.");
      }
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("El archivo de subtítulos está vacío o el video no tiene subtítulos disponibles.");
      }
      
      return { text: data.text, title: data.title || 'Tutorial Guardado' };

    } catch (error: any) {
      console.error("Transcript extraction error:", error);
      throw new Error(`Error al extraer subtítulos: ${error.message}`);
    }
  }
}
