export class AiService {
  async generate(prompt: string) {
    return { prompt, result: 'mocked-response' };
  }
}
