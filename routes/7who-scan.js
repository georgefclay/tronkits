/**
 * 7who AI scan proxy — Express router for the tronkits app.
 *
 * Mounted in app.js as:  app.use('/api/7who', require('./routes/7who-scan'));
 * Endpoint:              POST /api/7who/scan   body: { image: "data:image/jpeg;base64,..." }
 *
 * .env vars:
 *   ANTHROPIC_API_KEY    required if SEVENWHO_PROVIDER=anthropic (default)
 *   OPENAI_API_KEY       required if SEVENWHO_PROVIDER=openai
 *   SEVENWHO_PROVIDER    "anthropic" (default) or "openai"
 *   SEVENWHO_MODEL       optional override (defaults: claude-haiku-4-5 / gpt-5-mini)
 *
 * Requires Node 18+ (global fetch).
 */

const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const router = express.Router();

const ALLOWED_ORIGINS = [
  'https://7who.com',
  'https://www.7who.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

const PROMPT = `You are reading a photo of a business card. Extract the contact details and respond with ONLY a JSON object (no markdown, no commentary) with exactly these keys:
{
  "first_name": string,
  "last_name": string,
  "company": string,
  "job_title": string,
  "phones": [{"type": "mobile"|"work"|"fax"|"other", "number": string}],
  "emails": [string],
  "website": string,
  "address": string,
  "notes": string
}
Rules:
- Use empty string "" or empty array [] for anything not on the card. Never invent data.
- Normalize phone numbers to the format printed on the card (keep country code if shown).
- "address" is the full mailing address on one line, comma-separated.
- "notes" captures anything else useful printed on the card (tagline, certifications, social handles).
- Distinguish mobile vs office numbers using labels on the card (cell, mobile, m:, direct, o:, tel, fax).`;

// CORS (needed for localhost dev; same-origin in prod)
router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Cost protection: 30 scans / 15 min per IP. The tronkits app uses `trust proxy = true`
// (permissive), which express-rate-limit refuses to auto-derive keys from — so supply an
// explicit keyGenerator (Cloudflare header first, then Caddy-forwarded req.ip) and disable
// the trust-proxy validation error.
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  keyGenerator: (req) => req.headers['cf-connecting-ip'] || ipKeyGenerator(req.ip),
}));

function parseDataUrl(dataUrl) {
  const m = /^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!m) return null;
  return { mediaType: m[1], base64: m[2] };
}

function extractJson(text) {
  const trimmed = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model returned no JSON');
  return JSON.parse(trimmed.slice(start, end + 1));
}

async function callAnthropic(img) {
  const model = process.env.SEVENWHO_MODEL || 'claude-haiku-4-5';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.base64 } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return extractJson(text);
}

async function callOpenAI(img) {
  const model = process.env.SEVENWHO_MODEL || 'gpt-5-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:${img.mediaType};base64,${img.base64}` } },
        ],
      }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return extractJson(data.choices[0].message.content);
}

router.post('/scan', async (req, res) => {
  const img = parseDataUrl(req.body && req.body.image);
  if (!img) return res.status(400).json({ error: 'image must be a base64 image data URL' });

  const provider = (process.env.SEVENWHO_PROVIDER || 'anthropic').toLowerCase();
  const keyName = provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
  if (!process.env[keyName]) return res.status(500).json({ error: `${keyName} is not set in .env` });

  try {
    const contact = provider === 'openai' ? await callOpenAI(img) : await callAnthropic(img);
    res.json(contact);
  } catch (err) {
    console.error('7who scan error:', err.message);
    res.status(502).json({ error: String(err.message || err) });
  }
});

module.exports = router;
