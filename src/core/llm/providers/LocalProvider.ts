import { LLMMessage, LLMProvider, LLMResponse } from '../types';

/**
 * LocalProvider - talks to a locally running LLM server (e.g., text-generation-webui, Ollama, or custom)
 * Endpoint expectations:
 * POST http://localhost:8080/generate
 * body: { model, prompt }
 * response: { text, usage?: { promptTokens, completionTokens, totalTokens } }
 */
export class LocalProvider implements LLMProvider {
  constructor(private baseUrl = 'http://localhost:8080') {}

  async generateCompletion(
    messages: LLMMessage[],
    tools?: any[],
    systemInstruction?: string,
    modelName?: string
  ): Promise<LLMResponse> {
    const prompt = messages.map(m => (m.role === 'user' ? m.content : m.content)).join('\n');

    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, prompt, systemInstruction }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LocalProvider error: ${res.status} ${text}`);
    }

    const json = await res.json();
    return {
      content: json.text || null,
      usage: json.usage,
      raw: json,
      request: { contents: messages, systemInstruction, tools }
    } as LLMResponse;
  }

}

export default LocalProvider;
