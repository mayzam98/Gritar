import type { AiProvider, AiAnalysisResult } from '../domain/AiProvider';
import { YouTubeTranscriptService } from '../infrastructure/youtube/YouTubeTranscriptService';

export class AnalyzeYouTubeTutorialUseCase {
  private aiProvider: AiProvider;

  constructor(aiProvider: AiProvider) {
    this.aiProvider = aiProvider;
  }

  async execute(youtubeUrl: string): Promise<AiAnalysisResult> {
    // 1. Get the real transcript from YouTube
    let transcript: string;
    try {
      transcript = await YouTubeTranscriptService.getTranscript(youtubeUrl);
    } catch (error: any) {
      throw new Error(`Error al obtener subtítulos: ${error.message}`);
    }

    // Protect against huge transcripts breaking the LLM token limit
    // Slice to the first ~15,000 characters (approx 3000-4000 tokens)
    if (transcript.length > 15000) {
      transcript = transcript.slice(0, 15000) + '... [Transcript truncated]';
    }

    // 2. Send the extracted transcript to the AI Provider configured by the user
    try {
      const result = await this.aiProvider.analyzeTutorial(transcript);
      return result;
    } catch (error) {
      console.error("Error analyzing tutorial:", error);
      throw new Error("No se pudo analizar el tutorial con el proveedor de IA configurado.");
    }
  }
}
