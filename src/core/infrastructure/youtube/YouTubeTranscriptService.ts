export class YouTubeTranscriptService {
  /**
   * Fetches the transcript of a YouTube video using our custom Vite backend plugin.
   */
  static async getTranscript(youtubeUrl: string): Promise<string> {
    try {
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(youtubeUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo conectar a YouTube a través del servidor local.");
      }
      
      const data = await response.json();
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("El archivo de subtítulos está vacío o el video no tiene subtítulos disponibles.");
      }
      
      return data.text;

    } catch (error: any) {
      console.error("Transcript extraction error:", error);
      throw new Error(`Error al extraer subtítulos: ${error.message}`);
    }
  }
}
