import type { AiProvider } from '../../domain/AiProvider';
import { AiProviderType } from '../../domain/AiProvider';
import { OpenAiProvider } from './OpenAiProvider';
import { GeminiProvider } from './GeminiProvider';
import { DeepSeekProvider } from './DeepSeekProvider';

export class AiFactory {
  static createProvider(type: AiProviderType, apiKey: string): AiProvider {
    switch (type) {
      case AiProviderType.OPENAI:
        return new OpenAiProvider(apiKey);
      case AiProviderType.GEMINI:
        return new GeminiProvider(apiKey);
      case AiProviderType.DEEPSEEK:
        return new DeepSeekProvider(apiKey);
      default:
        throw new Error(`Unsupported AI Provider: ${type}`);
    }
  }
}
