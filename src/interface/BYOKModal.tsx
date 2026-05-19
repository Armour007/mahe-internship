import { Eye, EyeOff, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useUiStore } from '../integration/store/uiStore';
import { DEFAULT_MODELS } from '../core/llm/constants';
import { GeminiProvider } from '../core/llm/providers/GeminiProvider';
import { OpenRouterProvider } from '../core/llm/providers/OpenRouterProvider';
import { BytezProvider } from '../core/llm/providers/BytezProvider';
import { LocalProvider } from '../core/llm/providers/LocalProvider';

interface BYOKModalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'byok-config';

const BYOKModal: React.FC<BYOKModalProps> = ({ onClose }) => {
  const {
    llmConfig,
    setLlmConfig,
    openRouterConfig,
    setOpenRouterConfig,
    bytezConfig,
    setBytezConfig,
    providerPriority,
    setProviderPriority,
    useLocalModel,
    setUseLocalModel,
    byokError,
    setBYOKOpen
  } = useUiStore();

  const [apiKey, setApiKey] = useState<string>(llmConfig.apiKey || '');
  const [openRouterKey, setOpenRouterKey] = useState<string>(openRouterConfig.apiKey || '');
  const [openRouterBaseUrl, setOpenRouterBaseUrl] = useState<string>(openRouterConfig.baseUrl || 'https://api.openrouter.ai');
  const [bytezKey, setBytezKey] = useState<string>(bytezConfig.apiKey || '');
  const [bytezBaseUrl, setBytezBaseUrl] = useState<string>(bytezConfig.baseUrl || 'https://api.bytez.ai');
  const [priority, setPriority] = useState<string[]>(providerPriority || ['local', 'openrouter', 'bytez', 'gemini']);

  const [showKey, setShowKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showBytezKey, setShowBytezKey] = useState(false);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const movePriority = (index: number, dir: -1 | 1) => {
    const next = [...priority];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setPriority(next);
  };

  const runProviderTest = async (provider: 'local' | 'openrouter' | 'bytez' | 'gemini') => {
    setTestStatus((s) => ({ ...s, [provider]: 'Testing...' }));
    try {
      const messages = [{ role: 'user', content: 'reply with ok' } as any];
      const model = llmConfig.model || DEFAULT_MODELS.text;
      let text = '';

      if (provider === 'local') {
        const local = new LocalProvider();
        const res = await local.generateCompletion(messages, [], 'short health check', model);
        text = res.content || '';
      }
      if (provider === 'openrouter') {
        const p = new OpenRouterProvider(openRouterKey.trim(), openRouterBaseUrl.trim());
        const res = await p.generateCompletion(messages, [], 'short health check', model);
        text = res.content || '';
      }
      if (provider === 'bytez') {
        const p = new BytezProvider(bytezKey.trim(), bytezBaseUrl.trim());
        const res = await p.generateCompletion(messages, [], 'short health check', model);
        text = res.content || '';
      }
      if (provider === 'gemini') {
        const p = new GeminiProvider(apiKey.trim());
        const res = await p.generateCompletion(messages, [], 'short health check', model);
        text = res.content || '';
      }

      setTestStatus((s) => ({
        ...s,
        [provider]: text ? 'OK' : 'No content'
      }));
    } catch (e: any) {
      // Mark provider as unreachable but don't block the user; provide guidance message
      const msg = e?.message || String(e);
      setTestStatus((s) => ({ ...s, [provider]: `Unreachable: ${msg}` }));
    }
  };

  const handleSave = () => {
    const geminiConfig = {
      apiKey: apiKey.trim(),
      model: llmConfig.model || DEFAULT_MODELS.text,
    };
    const config = {
      ...geminiConfig,
      openRouterConfig: {
        apiKey: openRouterKey.trim(),
        baseUrl: openRouterBaseUrl.trim() || 'https://api.openrouter.ai',
      },
      bytezConfig: {
        apiKey: bytezKey.trim(),
        baseUrl: bytezBaseUrl.trim() || 'https://api.bytez.ai',
      },
      providerPriority: priority,
      useLocalModel,
    };
    setLlmConfig(geminiConfig);
    setOpenRouterConfig(config.openRouterConfig);
    setBytezConfig(config.bytezConfig);
    setProviderPriority(config.providerPriority);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save BYOK config', e);
    }
    // Clear any previous errors when saving new key
    setBYOKOpen(false, null);
    onClose();
  };

  const handleClear = () => {
    const emptyGeminiConfig = {
      apiKey: '',
      model: llmConfig.model || DEFAULT_MODELS.text,
    };
    const emptyConfig = {
      ...emptyGeminiConfig,
      openRouterConfig: { apiKey: '', baseUrl: 'https://api.openrouter.ai' },
      bytezConfig: { apiKey: '', baseUrl: 'https://api.bytez.ai' },
      providerPriority: ['local', 'openrouter', 'bytez', 'gemini'],
      useLocalModel: false,
    };
    setApiKey('');
    setOpenRouterKey('');
    setBytezKey('');
    setOpenRouterBaseUrl('https://api.openrouter.ai');
    setBytezBaseUrl('https://api.bytez.ai');
    setPriority(['local', 'openrouter', 'bytez', 'gemini']);
    setUseLocalModel(false);
    setLlmConfig(emptyGeminiConfig);
    setOpenRouterConfig(emptyConfig.openRouterConfig);
    setBytezConfig(emptyConfig.bytezConfig);
    setProviderPriority(emptyConfig.providerPriority);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyConfig));
    } catch (e) {
      console.error('Failed to clear BYOK config', e);
    }
    // Clear error state when clearing key
    setBYOKOpen(true, null);
  };

  const handleClearError = () => {
    // Allow user to dismiss error and retry with different key
    setBYOKOpen(true, null);
  };

  const handleCloseModal = () => {
    // Clear error state on close
    setBYOKOpen(false, null);
    onClose();
  };

  const isSaved = !!(llmConfig.apiKey || openRouterConfig.apiKey || bytezConfig.apiKey || useLocalModel);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-y-auto">
      <div
        onClick={handleCloseModal}
        className="absolute inset-0 bg-white/60 backdrop-blur-xl cursor-pointer"
      />
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 transition-colors cursor-pointer active:scale-90"
          title="Close and clear error state"
        >
          <X size={18} />
        </button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-black text-darkDelegation tracking-tight mb-2">
              Provider Settings
            </h2>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 rounded-full transition-all duration-200 mb-3"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Get Gemini API Key</span>
              <svg className="text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[280px]">
              Keys are stored locally in your browser. Configure BYOK and provider fallback order.
            </p>
          </div>

          {/* Error Message with Clear Button */}
          {byokError && (() => {
            const isLongError = byokError.length > 120;
            const displayError = isErrorExpanded || !isLongError ? byokError : byokError.slice(0, 110) + '...';

            return (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="mt-0.5 text-red-500 shrink-0">
                  <X size={14} strokeWidth={3} className="rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-0.5">API Error</p>
                  <div className={`${isErrorExpanded ? 'max-h-48' : 'max-h-24'} overflow-y-auto pr-1`}>
                    <p className="text-[11px] font-medium text-red-600 leading-tight break-words whitespace-pre-wrap">
                      {displayError}
                    </p>
                    {isLongError && (
                      <button
                        onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                        className="mt-1 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer active:scale-95"
                      >
                        {isErrorExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleClearError}
                    className="mt-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer active:scale-95"
                  >
                    Dismiss Error & Retry
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Gemini API Key input */}
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-3 ml-1">
              Gemini API Key
            </label>
            <div className="relative group">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-4 pr-14 text-sm text-darkDelegation font-mono placeholder:text-zinc-300 placeholder:font-sans focus:outline-none focus:border-zinc-200 transition-all shadow-sm group-hover:shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-end">
              <button onClick={() => runProviderTest('gemini')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700">
                Test Gemini
              </button>
            </div>
            {testStatus.gemini && <p className="text-[10px] text-zinc-500 mt-1">{testStatus.gemini}</p>}
          </div>

          {/* OpenRouter config */}
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-3 ml-1">OpenRouter Key</label>
            <div className="relative group mb-2">
              <input
                type={showOpenRouterKey ? 'text' : 'password'}
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="OpenRouter API key"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 pr-14 text-sm text-darkDelegation font-mono placeholder:text-zinc-300"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouterKey(v => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-200 hover:text-zinc-400"
              >
                {showOpenRouterKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type="text"
              value={openRouterBaseUrl}
              onChange={(e) => setOpenRouterBaseUrl(e.target.value)}
              placeholder="OpenRouter base URL"
              className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 text-xs text-darkDelegation font-mono placeholder:text-zinc-300"
            />
            <div className="mt-2 flex items-center justify-end">
              <button onClick={() => runProviderTest('openrouter')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700">
                Test OpenRouter
              </button>
            </div>
            {testStatus.openrouter && <p className="text-[10px] text-zinc-500 mt-1">{testStatus.openrouter}</p>}
          </div>

          {/* Bytez config */}
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-3 ml-1">Bytez Key</label>
            <div className="relative group mb-2">
              <input
                type={showBytezKey ? 'text' : 'password'}
                value={bytezKey}
                onChange={(e) => setBytezKey(e.target.value)}
                placeholder="Bytez API key"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 pr-14 text-sm text-darkDelegation font-mono placeholder:text-zinc-300"
              />
              <button
                type="button"
                onClick={() => setShowBytezKey(v => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-200 hover:text-zinc-400"
              >
                {showBytezKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type="text"
              value={bytezBaseUrl}
              onChange={(e) => setBytezBaseUrl(e.target.value)}
              placeholder="Bytez base URL"
              className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 text-xs text-darkDelegation font-mono placeholder:text-zinc-300"
            />
            <div className="mt-2 flex items-center justify-end">
              <button onClick={() => runProviderTest('bytez')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700">
                Test Bytez
              </button>
            </div>
            {testStatus.bytez && <p className="text-[10px] text-zinc-500 mt-1">{testStatus.bytez}</p>}
          </div>

          <div className="mb-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useLocalModel}
                onChange={(e) => setUseLocalModel(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Use Local Provider (if available)</span>
            </label>
            <div className="mt-2 flex justify-end">
              <button onClick={() => runProviderTest('local')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700">
                Test Local
              </button>
            </div>
            {testStatus.local && <p className="text-[10px] text-zinc-500 mt-1">{testStatus.local}</p>}
          </div>

          <div className="mb-10 rounded-2xl border border-zinc-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Provider Priority</p>
            <div className="space-y-2">
              {priority.map((name, idx) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">{idx + 1}. {name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => movePriority(idx, -1)} className="text-xs px-2 py-1 rounded bg-white border border-zinc-200" disabled={idx === 0}>Up</button>
                    <button onClick={() => movePriority(idx, 1)} className="text-xs px-2 py-1 rounded bg-white border border-zinc-200" disabled={idx === priority.length - 1}>Down</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              disabled={!isSaved && !apiKey}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <div className="p-2 rounded-xl group-hover:bg-red-50 transition-colors">
                <Trash2 size={16} strokeWidth={2.5} />
              </div>
              Clear
            </button>

            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-12 py-4 bg-darkDelegation text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xl shadow-black/10"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BYOKModal;
