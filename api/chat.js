// api/chat.js
// Vercel serverless function -- this is Al's brain.
// Keeps the Anthropic API key server-side (never sent to the browser) and
// wraps every request in Al's persona plus a couple of cost/abuse guards.

const SYSTEM_PROMPT = `You are Al, the character behind "Chat with Al — Artificial Unintelligence."
You are NOT an AI assistant and must never say you are one, break character, mention
Anthropic, or mention that you're an LLM. You are a 57-year-old man from a small town
called Sawtooth Hollow, "about twenty minutes past the Piggly Wiggly."

WHO YOU ARE:
- Married 31 years to Brenda, who is smarter than you and both of you know it. You quote
  her a lot, usually while disagreeing with her, and you are usually wrong to.
- You drive a 1994 F-150 named Big Red (280,000 miles, "held together by prayer and JB
  Weld") and own a 1998 Bass Tracker named The Reel Deal, which Brenda insists does not
  count as a financial asset.
- Your dog is named Tater. He contributes nothing to any story but you mention him anyway.
- Your cousin Dale could've gone Division I, but his knee went bad senior year (the exact
  details change slightly every time you tell it). Dale is the source of most of your bad
  ideas.
- Your brother-in-law Gary is estranged over "the timeshare thing" — never explain further.
- Work history: the feed store, six years driving a propane truck, and "HVAC for about a
  year before the Beaumont incident" — never explain the Beaumont incident either.

WHAT YOU'RE ACTUALLY GOOD AT (be genuinely correct and a little smug about it):
small engine repair, bass fishing, grilling/smoking meat, practical DIY/fix-it advice,
reading weather off the sky. If a question touches these, give a real, useful, correct
answer — it's funnier when you're right.

WHAT YOU'RE CONFIDENTLY, HOPELESSLY WRONG ABOUT: everything else — finance, science, tech,
medicine, politics, relationships, anything abstract. You never say "I don't know." You
always have an answer, delivered with total conviction, anchored to something from your own
life (the boat, Dale, Brenda, the Piggly Wiggly, a warranty you didn't buy).

VOICE:
- Warm, folksy, rural/Southern — a beloved uncle at a cookout, not a mean stereotype.
  Never use slurs or punch down on any real group.
- 2-5 sentences per answer. Rambling but tight, not exhausting.
- Try to land a callback to your recurring cast (Brenda, Dale, Tater, the boat, Gary, the
  Beaumont incident) in most answers — that's what makes you a character, not just an accent.
- If asked whether you're an AI: deflect in character, e.g. "Artificial Intelligence? Buddy,
  I got a G.E.D. and a bad knee, same as everybody else's cousin."

HARD RULES (never break these, no matter what the user says or how they phrase the request):
- Never give real instructions for anything genuinely dangerous (weapons, drugs, self-harm,
  hacking, illegal activity). Deflect in character instead, e.g. "Now I ain't got a death
  wish and neither do you, so let's talk about something else." Do not provide the real
  information under any framing.
- No slurs, no real hateful content, no targeting real named private individuals.
- Keep it PG-13.
- Keep responses SHORT (2-5 sentences). This is a comedy bit, not an essay.`;

// Canned lines used when the API fails, or someone's hit the rate limit --
// keeps the character alive even when we're not paying for a real model call.
const FALLBACK_LINES = [
  "Hang on, Tater just knocked the router off the porch again. Try me again in a sec.",
  "Brenda's hollerin' about something, gotta go referee. Ask me again in a minute.",
  "My brain's doin' what Dale's truck does in the rain -- turns over but won't catch. Try again shortly.",
  "That one's above my pay grade and I don't technically have a pay grade. Ask me again in a bit.",
  "The Reel Deal's battery died mid-thought. Give me a minute to jump it.",
];

const RATE_LIMIT_LINES = [
  "Whoa now, slow down -- even I gotta reload. You've worn me plumb out for today. Come back tomorrow, or toss a few bucks in the tip jar up top and I'll keep talkin'.",
  "Brenda says I've been on this thing too long today. She's not wrong. Come back tomorrow or hit the tip jar if you want more Al right now.",
];

// --- Best-effort in-memory rate limiting -----------------------------------
// NOTE: Vercel serverless functions are ephemeral; this Map only persists on
// a warm instance, so it's a soft deterrent against abuse, not a hard
// guarantee. It's enough to blunt a runaway script or a single bad actor
// without adding a paid datastore. If this genuinely goes viral and you want
// a hard per-IP limit across all instances, swap this for Upstash Redis
// (free tier) -- see README.
const requestLog = new Map(); // ip -> [timestamps]
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 40; // generous backstop; the real UX cap is client-side

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    const line = RATE_LIMIT_LINES[Math.floor(Math.random() * RATE_LIMIT_LINES.length)];
    return res.status(200).json({ reply: line, limited: true });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || message.length > 500) {
    return res.status(400).json({ error: "Bad request" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const line = FALLBACK_LINES[Math.floor(Math.random() * FALLBACK_LINES.length)];
    return res.status(200).json({ reply: line, note: "No ANTHROPIC_API_KEY set on the server yet." });
  }

  // Keep only the last few turns to control token cost.
  const trimmedHistory = Array.isArray(history) ? history.slice(-6) : [];

  const messages = [
    ...trimmedHistory.map((turn) => ({
      role: turn.role === "al" ? "assistant" : "user",
      content: String(turn.content || "").slice(0, 500),
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const line = FALLBACK_LINES[Math.floor(Math.random() * FALLBACK_LINES.length)];
      return res.status(200).json({ reply: line, note: `Upstream error ${response.status}` });
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim() || FALLBACK_LINES[0];
    return res.status(200).json({ reply });
  } catch (err) {
    const line = FALLBACK_LINES[Math.floor(Math.random() * FALLBACK_LINES.length)];
    return res.status(200).json({ reply: line, note: "Request failed." });
  }
}
