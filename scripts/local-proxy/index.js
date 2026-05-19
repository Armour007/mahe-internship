const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8090;
const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || 'http://localhost:8080';
const ALLOWED_KEYS = (process.env.ALLOWED_KEYS || '').split(',').map(s => s.trim()).filter(Boolean);

// Simple per-key in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // per key
const counters = new Map();

function checkRateLimit(key) {
  const now = Date.now();
  let entry = counters.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }
  entry.count += 1;
  counters.set(key, entry);
  return entry.count <= MAX_REQUESTS_PER_WINDOW;
}

app.post('/generate', async (req, res) => {
  try {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (!key || !ALLOWED_KEYS.includes(key)) {
      return res.status(401).json({ error: 'Unauthorized. Provide a valid x-api-key.' });
    }
    if (!checkRateLimit(key)) {
      return res.status(429).json({ error: 'Rate limit exceeded for key.' });
    }

    // Forward to local LLM
    const body = req.body || {};
    const safeBody = {
      model: body.model,
      prompt: body.prompt,
      systemInstruction: body.systemInstruction,
    };

    if (!safeBody.prompt || typeof safeBody.prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string)' });
    }

    if (typeof fetch !== 'function') {
      return res.status(500).json({ error: 'Global fetch not available. Use Node 18+.' });
    }

    const forward = await fetch(`${LOCAL_LLM_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safeBody),
    });

    const text = await forward.text();
    res.status(forward.status).send(text);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Local proxy listening on ${PORT}, forwarding to ${LOCAL_LLM_URL}`);
});
