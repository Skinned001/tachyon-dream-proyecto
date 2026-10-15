export class OllamaProvider {
  async generate(prompt: string) {
    return { prompt, response: 'pending-ai-response' };
  }
}
