Local LLM Runbook

This document explains how to run a local LLM for offline/unlimited demos and how Vector HQ integrates with it.

Recommended quick options:

1) Ollama (recommended for simplicity)

- Install Ollama (https://ollama.com).
- Pull a small model, for example: `ollama pull llama2-mini` (or any model you prefer).
- Run the server: `ollama serve --port 8080`

2) text-generation-webui / locally hosted diffusion servers

- Many community tools expose a simple HTTP endpoint at `/generate` that accepts POST { model, prompt } and returns { text, usage }.

Local API contract (what Vector HQ expects):

POST http://localhost:8080/generate
Request JSON: { model?: string, prompt: string, systemInstruction?: string }
Response JSON: {
  text: string,
  usage?: { promptTokens?: number, completionTokens?: number, totalTokens?: number },
  tool_calls?: any[]
}

Notes on security & resource usage:
- Running local LLMs can be resource intensive (CPU/GPU). Choose models sized for your hardware.
- Local server avoids external quota and keeps data local (meets "no user data collection" requirement).


Docker Compose (recommended for demos)

1. Edit `docker-compose.yml` and set `ALLOWED_KEYS` in the `local-proxy` service to a comma-separated list of API keys you will use (these keys are simple app-level keys to gate public access to the model).

2. Start services:

```bash
docker compose up -d
```

3. The local LLM (Ollama) will be available at `http://localhost:8080` and the proxy at `http://localhost:8090/generate` which requires `x-api-key` header.

4. The stack auto-pulls a default model (`qwen2.5:7b-instruct-q4_K_M`) on first startup. First run can take several minutes depending on network speed.

Example curl request via proxy:

```bash
curl -X POST http://localhost:8090/generate -H "Content-Type: application/json" -H "x-api-key: YOUR_KEY" -d '{"model":"qwen-7b","prompt":"Hello world"}'
```

Notes:
- The proxy enforces a basic per-key rate limit and is intentionally simple. For production/public demos you should deploy a proper authentication layer, persistent quotas, and billing.
- Running a local high-capacity model (Qwen-Omni, Qwen3) requires substantial GPU/VRAM and is not "free" — hosting costs apply even if you run on your own machine (power, hardware, maintenance).

If you prefer `text-generation-webui` or `ggml` binaries, follow their respective docs and ensure an HTTP endpoint is available at `/generate`.

Integration checklist performed in repo:
- `src/core/llm/providers/LocalProvider.ts` implemented to POST to `/generate`.
- `useUiStore.useLocalModel` toggle added and surfaced in `ProjectView`.
- Economy mode cap added to `AgentBrain` to limit outputs when enabled.

How to enable local model in the app:
- Open Project View and click the "Prefer Local Model" toggle.
- Ensure a local LLM server is running at `http://localhost:8080` (or adjust `LocalProvider` base URL).

Advanced: If your local server supports `max_tokens` or similar options, extend `LocalProvider.generateCompletion` to forward `max_tokens` from `useUiStore.getState().maxCompletionWords`.

