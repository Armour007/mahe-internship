import React, { useEffect, useState } from 'react';
import { useUiStore } from '../integration/store/uiStore';
import { DEFAULT_MODELS } from '../core/llm/constants';

const STORAGE_KEY = 'byok-config';
const WIZARD_SEEN = 'byok-wizard-seen';

const FirstTimeWizard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    llmConfig,
    setLlmConfig,
    openRouterConfig,
    setOpenRouterConfig,
    bytezConfig,
    setBytezConfig,
    useLocalModel,
    setUseLocalModel,
    setProviderPriority,
  } = useUiStore();

  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState<'byok' | 'local'>('byok');
  const [geminiKey, setGeminiKey] = useState(llmConfig.apiKey || '');
  const [openKey, setOpenKey] = useState(openRouterConfig.apiKey || '');
  const [bytezKey, setBytezKey] = useState(bytezConfig.apiKey || '');

  useEffect(() => {
    // stop if user already configured something
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.apiKey || cfg.openRouterConfig?.apiKey || cfg.bytezConfig?.apiKey || cfg.useLocalModel) {
          handleClose();
        }
      } catch {}
    }
  }, []);

  const persist = (cfg: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.warn('Failed to persist BYOK config', e);
    }
  };

  const handleFinish = () => {
    const config = {
      apiKey: geminiKey.trim(),
      model: llmConfig.model || DEFAULT_MODELS.text,
      openRouterConfig: { apiKey: openKey.trim(), baseUrl: openRouterConfig.baseUrl },
      bytezConfig: { apiKey: bytezKey.trim(), baseUrl: bytezConfig.baseUrl },
      providerPriority: ['local', 'openrouter', 'bytez', 'gemini'],
      useLocalModel,
    };

    setLlmConfig({ apiKey: config.apiKey, model: config.model });
    setOpenRouterConfig(config.openRouterConfig);
    setBytezConfig(config.bytezConfig);
    setProviderPriority(config.providerPriority);
    persist(config);
    try { localStorage.setItem(WIZARD_SEEN, '1'); } catch {}
    handleClose();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6 pointer-events-auto">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl border border-zinc-100">
        <h3 className="text-2xl font-black mb-4">Welcome — Quick Setup</h3>

        <div className="mb-4">
          <div className="flex gap-3 mb-3">
            <button onClick={() => setStep(1)} className={`px-3 py-2 rounded ${step===1?'bg-zinc-100':''}`}>1. Choose</button>
            <button onClick={() => setStep(2)} className={`px-3 py-2 rounded ${step===2?'bg-zinc-100':''}`}>2. Configure</button>
            <button onClick={() => setStep(3)} className={`px-3 py-2 rounded ${step===3?'bg-zinc-100':''}`}>3. Test & Finish</button>
          </div>

          {step === 1 && (
            <div>
              <p className="mb-3 text-sm text-zinc-600">Choose how you'd like to run LLMs for this session.</p>
              <div className="flex gap-3">
                <label className={`p-4 border rounded-lg cursor-pointer ${choice==='byok'?'border-darkDelegation':''}`}>
                  <input type="radio" name="choice" checked={choice==='byok'} onChange={() => setChoice('byok')} /> BYOK (use your API keys)
                </label>
                <label className={`p-4 border rounded-lg cursor-pointer ${choice==='local'?'border-darkDelegation':''}`}>
                  <input type="radio" name="choice" checked={choice==='local'} onChange={() => setChoice('local')} /> Local (run a model locally)
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-3 text-sm text-zinc-600">Paste keys (you can add these later in Settings)</p>
              {choice === 'byok' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-500">OpenRouter Key</label>
                    <input value={openKey} onChange={(e) => setOpenKey(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="sk-..." />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Bytez Key</label>
                    <input value={bytezKey} onChange={(e) => setBytezKey(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="key" />
                  </div>
                </div>
              )}

              {choice === 'local' && (
                <div>
                  <p className="text-sm text-zinc-600">Enable Local Provider (ensure your local runtime is running on port 8080).</p>
                  <label className="inline-flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={useLocalModel} onChange={(e) => setUseLocalModel(e.target.checked)} /> Use Local Provider
                  </label>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-3 text-sm text-zinc-600">Quick test: you can finish or go back to refine keys.</p>
              <div className="flex gap-2">
                <button onClick={handleFinish} className="px-4 py-2 bg-darkDelegation text-white rounded">Finish Setup</button>
                <button onClick={() => { localStorage.setItem(WIZARD_SEEN,'1'); handleClose(); }} className="px-4 py-2 border rounded">Skip</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => setStep(Math.max(1, step-1))} className="px-3 py-2 border rounded">Back</button>
          <button onClick={() => setStep(Math.min(3, step+1))} className="px-3 py-2 bg-zinc-100 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeWizard;
