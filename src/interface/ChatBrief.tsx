import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useCoreStore } from '../integration/store/coreStore';
import { useUiStore } from '../integration/store/uiStore';
import { AGENTIC_SETS } from '../data/agents';

const generateSampleBrief = (teamName: string) => {
  switch (teamName) {
    case 'Vector HQ Studio':
      return 'Brand refresh for a mid-stage SaaS startup: deliver new logo, 3 hero concepts, and a launch email sequence. Emphasize trust, speed, and simplicity.';
    case 'Nano Banana Lab':
      return 'Create a photorealistic product shot: a matte black wireless speaker on a marble table, soft window light, shallow depth of field, modern minimalist style.';
    case 'Lyria Factory':
      return 'Compose a 90s-inspired synthwave track for a product teaser: 100-110 BPM, lush pads, punchy kick, nostalgic lead melody.';
    case 'Veo Studio':
      return 'Short cinematic scene plan (60s): opening establishing shot, character intro, rising tension, product reveal, cinematic color grade references.';
    case 'Strategy Coach':
      return 'Provide a 3-month go-to-market roadmap for an AI-powered CRM: target personas, channels, key metrics, and MVP features.';
    default:
      return 'Create a concise deliverable: define scope, main deliverables, success criteria, and a 2-week milestone plan.';
  }
};

const ChatBrief: React.FC = () => {
  const { setUserBrief } = useCoreStore();
  const { llmConfig, openRouterConfig, bytezConfig, useLocalModel, setBYOKOpen } = useUiStore();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const hasProviderConfigured = Boolean(
    llmConfig?.apiKey ||
    openRouterConfig?.apiKey ||
    bytezConfig?.apiKey ||
    useLocalModel
  );

  const send = () => {
    if (!value.trim()) return;
    if (!hasProviderConfigured) {
      setBYOKOpen(true, 'Configure at least one provider (Gemini, OpenRouter, Bytez, or Local) before sending your brief.');
      return;
    }
    setSending(true);
    // set the brief
    setUserBrief(value.trim());
    setTimeout(() => {
      setSending(false);
      setValue('');
    }, 250);
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        placeholder="Type project brief or paste notes..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full p-3 rounded-lg border border-zinc-100 text-sm resize-none bg-white/50 placeholder-zinc-300"
      />

      <div className="flex gap-2 flex-wrap">
        {AGENTIC_SETS.slice(0,6).map((s) => (
          <button
            key={s.id}
            onClick={() => setValue(generateSampleBrief(s.teamName))}
            title={`Insert sample brief for ${s.teamName}`}
            className="px-2 py-1 text-xs border rounded bg-white/80 hover:bg-zinc-50"
          >{s.teamName}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={send}
          disabled={!value.trim() || sending || !hasProviderConfigured}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
        >
          <Send size={14} />
          {hasProviderConfigured ? 'Send' : 'Configure Provider First'}
        </button>

        <button
          onClick={() => setValue('')}
          disabled={!value.trim()}
          className="px-3 py-2 bg-transparent border border-zinc-100 rounded-lg text-sm"
        >
          Clear
        </button>
      </div>

      {!hasProviderConfigured && (
        <p className="text-[11px] text-amber-600 font-medium">
          Add a provider key from "API Key (BYOK)" before submitting.
        </p>
      )}
    </div>
  );
};

export default ChatBrief;
