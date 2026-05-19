import { LLMMessage, LLMProvider, LLMResponse } from '../types';

/**
 * BytezProvider - generic wrapper for Bytez-like gateways. Base URL should be configured in uiStore.bytezConfig.baseUrl
 */
export class BytezProvider implements LLMProvider {
  constructor(private apiKey: string, private baseUrl = 'https://api.bytez.ai') {}

  async generateCompletion(
    messages: LLMMessage[],
    tools?: any[],
    systemInstruction?: string,
    modelName?: string
  ): Promise<LLMResponse> {
    const prompt = messages.map(m => m.content).join('\n');

    const res = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: modelName, prompt, systemInstruction }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bytez error: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content = json?.text || (json?.output?.[0]?.text) || '';
    return {
      content,
      usage: json.usage,
      raw: json,
      request: { contents: messages, systemInstruction, tools }
    } as LLMResponse;
  }
}

export default BytezProvider;
