import { LLMMessage } from '../types';

export class MockProvider {
  constructor() {}

  async generateCompletion(messages: LLMMessage[], tools: any[], systemPrompt: string, model: string) {
    // Produce a deterministic, structured mock response derived from the last user message
    const last = messages && messages.length ? messages[messages.length - 1].content : 'No prompt';
    const content = `MOCK RESPONSE FOR: ${String(last).slice(0, 200)}\n\n1) Logo concepts:\n- Concept A: modern mark + wordmark — rationale.\n- Concept B: emblematic monogram — rationale.\n- Concept C: geometric wordmark — rationale.\n\n2) Hero headlines and subheads:\n- Concept A: Headline / Subhead...\n\n3) Email subjects (6):\n- Launch: "Introducing..." — intent\n- Follow-up...\n\n4) Success metrics:\n- Activation, Conversion, MRR increase\n\n5) 2-week milestone plan:\n- Week 1: research, concepts; Week 2: iterate, finalize.`;

    return {
      content,
      usage: { prompt_tokens: 1, completion_tokens: 1 },
      tool_calls: [],
      raw: { provider: 'mock' }
    };
  }
}
