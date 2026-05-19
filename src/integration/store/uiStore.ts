import { create } from 'zustand';
import { getAllAgents } from '../../data/agents';
import { AgentState, CharacterState } from '../../types';
import { useTeamStore, getActiveAgentSet } from './teamStore';
import { DEFAULT_MODELS } from '../../core/llm/constants';

const STORAGE_KEY = 'byok-config';

const savedConfig = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

export const useUiStore = create<CharacterState>()(
  (set) => ({
    isThinking: false,
    instanceCount: getAllAgents(getActiveAgentSet()).length + 1, // +1 for user

    selectedNpcIndex: null,
    selectedPosition: null,
    hoveredNpcIndex: null,
    hoveredPoiId: null,
    hoveredPoiLabel: null,
    hoverPosition: null,
    npcScreenPositions: {},
    isChatting: false,
    isTyping: false,
    chatMessages: [],
    inspectorTab: 'info',
    agentStatuses: {},
    setAgentStatus: (index: number, status: AgentState) => set((s) => ({
      agentStatuses: { ...s.agentStatuses, [index]: status }
    })),

    isBYOKOpen: false,
    byokError: null,
    setBYOKOpen: (open: boolean, error: string | null = null) =>
      set({ isBYOKOpen: open, byokError: error }),

    activeAuditTaskId: null,
    setActiveAuditTaskId: (taskId: string | null) => set({ activeAuditTaskId: taskId }),

    llmConfig: {
      apiKey: savedConfig?.apiKey || '',
      model: savedConfig?.model || DEFAULT_MODELS.text,
    },

    setThinking: (isThinking: boolean) => set({ isThinking }),
    setIsTyping: (isTyping: boolean) => set({ isTyping }),
    setInspectorTab: (tab: 'info' | 'chat') => set({ inspectorTab: tab }),
    setInstanceCount: (count: number) => set({ instanceCount: count }),

    setSelectedNpc: (index: number | null) => set({
      selectedNpcIndex: index,
      selectedPosition: null,
    }),
    setSelectedPosition: (pos: { x: number; y: number } | null) => set({ selectedPosition: pos }),
    setHoveredNpc: (index: number | null, pos: { x: number; y: number } | null) => set({
      hoveredNpcIndex: index,
      hoverPosition: pos,
      hoveredPoiId: null,
      hoveredPoiLabel: null,
    }),
    setHoveredPoi: (id: string | null, label: string | null, pos: { x: number; y: number } | null) => set({
      hoveredPoiId: id,
      hoveredPoiLabel: label,
      hoverPosition: pos,
      hoveredNpcIndex: null,
    }),
    setLlmConfig: (config) => set((s) => ({ llmConfig: { ...s.llmConfig, ...config } })),
    useLocalModel: !!savedConfig?.useLocalModel,
    setUseLocalModel: (val: boolean) => set({ useLocalModel: val }),

    // Economy mode: cap completion length to reduce token usage.
    economyMode: typeof savedConfig?.economyMode === 'boolean' ? savedConfig.economyMode : true,
    maxCompletionWords: Number(savedConfig?.maxCompletionWords || 300),
    setEconomyMode: (val: boolean) => set({ economyMode: val }),
    setMaxCompletionWords: (n: number) => set({ maxCompletionWords: n }),

    // Provider orchestration / BYOK configs
    providerPriority: Array.isArray(savedConfig?.providerPriority)
      ? savedConfig.providerPriority
      : ['local', 'openrouter', 'bytez', 'gemini'],
    setProviderPriority: (arr: string[]) => set({ providerPriority: arr }),

    openRouterConfig: {
      apiKey: savedConfig?.openRouterConfig?.apiKey || '',
      baseUrl: savedConfig?.openRouterConfig?.baseUrl || 'https://api.openrouter.ai',
    },
    setOpenRouterConfig: (cfg: any) => set((s) => ({ openRouterConfig: { ...s.openRouterConfig, ...cfg } })),

    bytezConfig: {
      apiKey: savedConfig?.bytezConfig?.apiKey || '',
      baseUrl: savedConfig?.bytezConfig?.baseUrl || 'https://api.bytez.ai',
    },
    setBytezConfig: (cfg: any) => set((s) => ({ bytezConfig: { ...s.bytezConfig, ...cfg } })),

    setChatting: (isChatting: boolean) => set((s) => ({ 
      isChatting, 
      isTyping: isChatting ? s.isTyping : false,
      isThinking: isChatting ? s.isThinking : false,
      chatMessages: isChatting ? s.chatMessages : []
    })),
  })
);

// Keep instanceCount in sync whenever the active agent set changes
useTeamStore.subscribe((state, prevState) => {
  if (state.selectedAgentSetId !== prevState.selectedAgentSetId) {
    const system = getActiveAgentSet();
    useUiStore.getState().setInstanceCount(getAllAgents(system).length + 1);
  }
});
