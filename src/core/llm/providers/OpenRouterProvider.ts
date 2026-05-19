import { LLMMessage, LLMProvider, LLMResponse } from '../types';

/**
 * OpenRouterProvider - thin wrapper for OpenRouter-compatible endpoints.
 */
export class OpenRouterProvider implements LLMProvider {
  constructor(private apiKey: string, private baseUrl = 'https://api.openrouter.ai') {}

  async generateCompletion(
    messages: LLMMessage[],
    tools?: any[],
    systemInstruction?: string,
    modelName?: string
  ): Promise<LLMResponse> {
    const prompt = messages.map(m => m.content).join('\n');

    const body = {
      model: modelName,
      messages: [{ role: 'system', content: systemInstruction }, ...messages.map(m => ({ role: m.role, content: m.content }))]
    };

    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter error: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content || json?.text || '';
    return {
      content,
      usage: json.usage,
      raw: json,
      request: { contents: messages, systemInstruction, tools }
    } as LLMResponse;
  }
}

export default OpenRouterProvider;
