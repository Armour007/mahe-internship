# Zero-Budget Deployment Plan (Realistic)

This guide is for shipping Vector HQ when you have no budget.

## Reality Check

You can make the app free for users only if inference runs on user hardware (browser/device) or your own machine.
If you host model inference centrally for "anyone", it is not truly free or unlimited because compute, bandwidth, and uptime cost money.

## Best Zero-Cost Architecture

Use a hybrid model:

1. Static frontend hosting (free tier)
- Deploy this Vite app to GitHub Pages / Cloudflare Pages / Netlify free tier.
- This hosts only UI, no paid backend required.

2. BYOK-first cloud inference (free for you)
- Users bring their own keys for Gemini/OpenRouter/Bytez.
- Your infra does not pay inference costs.

3. Local model option for users (free for you)
- Users who want "unlimited" can run local model server on their own PC.
- App points to local endpoint (`http://localhost:8080` or your proxy).

4. Optional self-hosted shared local node (NOT fully free)
- You can expose one model machine publicly, but then you pay power/hardware/internet and must enforce quotas.

## What Is Already Implemented

- Provider failover in app: Local -> OpenRouter -> Bytez -> Gemini.
- BYOK config fields in `uiStore`.
- Local model toggle in project UI.
- Economy mode output cap for lower token usage.
- Docker compose with Ollama + proxy.

## One-Command Local Stack (for your own machine)

```bash
docker compose up -d
```

Services:
- Ollama on `http://localhost:8080`
- Proxy on `http://localhost:8090/generate` (requires `x-api-key`)

## Minimum Production-Safe Rules (No Budget)

1. Never expose raw local model endpoint directly.
2. Keep proxy auth enabled (`ALLOWED_KEYS`).
3. Rotate keys if leaked.
4. Keep strict rate limits to avoid abuse.
5. Prefer BYOK for public users so your machine is not a free public GPU.

## Recommended Public Positioning

- "Free app UI + BYOK support + local model support"
- Do not promise globally unlimited free inference from your own server.

## Fast Launch Checklist

1. Deploy frontend on free static host.
2. Validate BYOK flows (Gemini/OpenRouter/Bytez).
3. Validate local mode using Docker stack.
4. Set default mode to BYOK or local-preferred.
5. Publish short onboarding steps for users.

## If You Later Get Budget

- Add managed auth.
- Add persistent per-user quotas.
- Add queueing and autoscaling.
- Add observability and abuse detection.
