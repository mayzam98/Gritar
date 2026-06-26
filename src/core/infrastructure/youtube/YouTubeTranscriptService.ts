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
        let errorMessage = data.error || "No se pudo conectar a YouTube a través del servidor local.";
        if (errorMessage.includes("Transcript is disabled")) {
          errorMessage = "Este video de YouTube no tiene subtítulos (CC) habilitados o no están disponibles. La IA necesita que el video tenga subtítulos para poder analizarlo. Por favor, intenta con otro video.";
        }
        throw new Error(errorMessage);
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
