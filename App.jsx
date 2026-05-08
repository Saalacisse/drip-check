import { useState, useRef, useEffect } from "react";

// ─── TRACKING ────────────────────────────────────────────────────────────────
// Simulated session tracker (in production → Bitly API + Supabase)
const TRACKING = {
  sessionId: Math.random().toString(36).slice(2, 10),
  log: (event, data = {}) => {
    const entry = { event, ts: new Date().toISOString(), session: TRACKING.sessionId, ...data };
    const logs = JSON.parse(sessionStorage.getItem("dc_logs") || "[]");
    logs.push(entry);
    sessionStorage.setItem("dc_logs", JSON.stringify(logs));
    console.log("📊 DRIP TRACK:", entry);
  },
  getLogs: () => JSON.parse(sessionStorage.getItem("dc_logs") || "[]")
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #080808;
    --white: #f5f0e8;
    --yellow: #FFE234;
    --pink: #FF3CAC;
    --green: #00FF87;
    --red: #FF2D2D;
    --purple: #B44FFF;
  }

  body { background: var(--black); }

  .app {
    background: var(--black);
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    color: var(--white);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 80px 0;
    position: relative;
    max-width: 430px;
    margin: 0 auto;
  }

  .noise {
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 100;
  }

  /* ── HEADER ── */
  .header {
    width: 100%;
    padding: 28px 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo-wrap { position: relative; }

  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 76px;
    letter-spacing: 8px;
    line-height: 1;
    background: linear-gradient(135deg, var(--yellow) 0%, var(--pink) 60%, var(--purple) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 40px rgba(255,226,52,0.25));
    animation: logoPulse 4s ease-in-out infinite;
  }

  @keyframes logoPulse {
    0%,100% { filter: drop-shadow(0 0 40px rgba(255,226,52,0.25)); }
    50% { filter: drop-shadow(0 0 60px rgba(255,60,172,0.35)); }
  }

  .logo-beta {
    position: absolute;
    top: 6px; right: -36px;
    background: var(--pink);
    color: white;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 1px;
  }

  .tagline {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(245,240,232,0.35);
    text-transform: uppercase;
    margin-top: 6px;
  }

  .stats-row {
    display: flex;
    gap: 20px;
    margin-top: 14px;
    align-items: center;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: var(--yellow);
    line-height: 1;
  }

  .stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 1px;
    color: rgba(245,240,232,0.3);
    text-transform: uppercase;
  }

  .stat-sep {
    width: 1px;
    height: 28px;
    background: rgba(255,255,255,0.08);
  }

  /* ── LANG TOGGLE ── */
  .lang-row {
    display: flex;
    gap: 6px;
    margin-top: 14px;
  }

  .lang-btn {
    padding: 4px 12px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(245,240,232,0.45);
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 1px;
  }

  .lang-btn.active {
    background: rgba(255,255,255,0.08);
    color: var(--white);
    border-color: rgba(255,255,255,0.25);
  }

  /* ── UPLOAD ── */
  .upload-zone {
    margin: 24px 20px 0;
    width: calc(100% - 40px);
    border: 2px dashed rgba(255,226,52,0.25);
    border-radius: 24px;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255,226,52,0.02);
    position: relative;
    overflow: hidden;
  }

  .upload-zone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(255,226,52,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .upload-zone:hover, .upload-zone.drag {
    border-color: var(--yellow);
    background: rgba(255,226,52,0.05);
    transform: scale(1.01);
  }

  .upload-icon { font-size: 44px; line-height: 1; animation: bounce 2s ease-in-out infinite; }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .upload-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 2px;
    color: var(--yellow);
  }

  .upload-sub {
    font-size: 12px;
    color: rgba(245,240,232,0.35);
    text-align: center;
    line-height: 1.6;
  }

  .upload-btn {
    margin-top: 6px;
    background: var(--yellow);
    color: var(--black);
    border: none;
    padding: 11px 26px;
    border-radius: 100px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,226,52,0.35);
  }

  /* ── PREVIEW ── */
  .preview-wrap {
    margin: 24px 20px 0;
    width: calc(100% - 40px);
    position: relative;
  }

  .preview-img {
    width: 100%;
    border-radius: 20px;
    display: block;
    max-height: 380px;
    object-fit: cover;
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(to bottom, transparent 60%, rgba(8,8,8,0.6) 100%);
  }

  .preview-change {
    position: absolute;
    top: 12px; right: 12px;
    background: rgba(8,8,8,0.75);
    border: 1px solid rgba(245,240,232,0.18);
    color: var(--white);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    cursor: pointer;
    backdrop-filter: blur(12px);
    transition: all 0.2s;
  }

  .preview-change:hover { background: rgba(8,8,8,0.95); }

  /* ── OCCASION ── */
  .section {
    margin: 20px 20px 0;
    width: calc(100% - 40px);
  }

  .section-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(245,240,232,0.35);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .pills { display: flex; flex-wrap: wrap; gap: 8px; }

  .pill {
    padding: 7px 15px;
    border-radius: 100px;
    border: 1px solid rgba(245,240,232,0.12);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: rgba(245,240,232,0.7);
  }

  .pill:hover { border-color: rgba(245,240,232,0.35); color: var(--white); }

  .pill.active {
    background: var(--yellow);
    color: var(--black);
    border-color: var(--yellow);
    font-weight: 600;
  }

  /* ── STYLE PICKER ── */
  .style-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .style-card {
    padding: 10px 8px;
    border-radius: 14px;
    border: 1px solid rgba(245,240,232,0.1);
    background: rgba(255,255,255,0.03);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .style-card:hover { border-color: rgba(255,226,52,0.3); }

  .style-card.active {
    border-color: var(--yellow);
    background: rgba(255,226,52,0.08);
  }

  .style-icon { font-size: 22px; display: block; margin-bottom: 4px; }
  .style-name { font-size: 11px; color: rgba(245,240,232,0.7); font-weight: 500; }
  .style-card.active .style-name { color: var(--yellow); }

  /* ── ANALYZE BTN ── */
  .analyze-btn {
    margin: 24px 20px 0;
    width: calc(100% - 40px);
    background: linear-gradient(135deg, var(--yellow), var(--pink));
    border: none;
    border-radius: 18px;
    padding: 18px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 4px;
    color: var(--black);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .analyze-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    pointer-events: none;
  }

  .analyze-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 14px 40px rgba(255,60,172,0.45);
  }

  .analyze-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── LOADING ── */
  .loading-wrap {
    margin: 40px 20px 0;
    width: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .loading-emoji { font-size: 40px; animation: spin 1.5s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .loading-text {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--yellow);
  }

  .loading-bar {
    width: 100%;
    height: 3px;
    background: rgba(255,226,52,0.12);
    border-radius: 10px;
    overflow: hidden;
  }

  .loading-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--yellow), var(--pink), var(--purple));
    border-radius: 10px;
    animation: loadBar 2.5s ease-in-out infinite;
  }

  @keyframes loadBar { 0%{width:0%} 70%{width:85%} 100%{width:95%} }

  /* ── RESULT ── */
  .result-card {
    margin: 24px 20px 0;
    width: calc(100% - 40px);
    background: #111;
    border-radius: 28px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }

  .result-top {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .score-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(245,240,232,0.3);
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 88px;
    line-height: 1;
  }

  .score-fire { color: var(--green); text-shadow: 0 0 50px rgba(0,255,135,0.5); }
  .score-good { color: var(--yellow); text-shadow: 0 0 40px rgba(255,226,52,0.45); }
  .score-mid  { color: var(--pink); text-shadow: 0 0 40px rgba(255,60,172,0.4); }
  .score-low  { color: var(--red); text-shadow: 0 0 40px rgba(255,45,45,0.4); }

  .vibe-side { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .vibe-emoji { font-size: 46px; }
  .vibe-tag {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(245,240,232,0.4);
    max-width: 130px;
    line-height: 1.5;
    text-align: right;
  }

  .divider { margin: 14px 20px; height: 1px; background: rgba(255,255,255,0.06); }

  .verdict {
    padding: 0 20px;
    font-size: 14.5px;
    line-height: 1.75;
    color: rgba(245,240,232,0.9);
  }

  .verdict strong { color: var(--yellow); }

  /* comparison card */
  .comparison {
    margin: 14px 20px;
    background: rgba(255,226,52,0.05);
    border: 1px solid rgba(255,226,52,0.12);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .comp-icon { font-size: 34px; flex-shrink: 0; }

  .comp-body { flex: 1; }

  .comp-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 1px;
    color: var(--yellow);
    display: block;
    margin-bottom: 3px;
  }

  .comp-text { font-size: 12.5px; line-height: 1.6; color: rgba(245,240,232,0.6); }

  /* refs row */
  .refs-row {
    padding: 0 20px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  .ref-tag {
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(180,79,255,0.12);
    border: 1px solid rgba(180,79,255,0.2);
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: var(--purple);
    letter-spacing: 0.5px;
  }

  /* challenge */
  .challenge {
    margin: 10px 20px 20px;
    background: rgba(255,60,172,0.06);
    border: 1px solid rgba(255,60,172,0.18);
    border-radius: 14px;
    padding: 13px;
    font-size: 13px;
    line-height: 1.65;
    color: rgba(245,240,232,0.75);
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .challenge-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

  /* ── SHARE ROW ── */
  .share-row {
    margin: 16px 20px 0;
    width: calc(100% - 40px);
    display: flex;
    gap: 10px;
  }

  .share-btn {
    flex: 1;
    padding: 13px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: rgba(245,240,232,0.7);
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .share-btn:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }

  .share-btn.insta {
    background: linear-gradient(135deg, #E1306C, #833AB4);
    border: none;
    color: white;
    font-weight: 700;
    flex: 1.4;
  }

  .share-btn.insta:hover { box-shadow: 0 8px 24px rgba(225,48,108,0.4); }

  .share-btn.tiktok {
    background: #000;
    border: 1px solid rgba(255,255,255,0.15);
    color: white;
  }

  .share-btn.tiktok:hover { box-shadow: 0 8px 24px rgba(255,0,80,0.25); }

  /* ── SHARE TOAST ── */
  .toast {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,255,135,0.15);
    border: 1px solid var(--green);
    color: var(--green);
    padding: 10px 20px;
    border-radius: 100px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    z-index: 200;
    animation: fadeInOut 2.5s ease forwards;
    white-space: nowrap;
  }

  @keyframes fadeInOut { 0%{opacity:0;transform:translateX(-50%) translateY(10px)} 15%,75%{opacity:1;transform:translateX(-50%) translateY(0)} 100%{opacity:0;transform:translateX(-50%) translateY(-10px)} }

  /* ── STATS PANEL ── */
  .stats-panel {
    margin: 16px 20px 0;
    width: calc(100% - 40px);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 14px 16px;
  }

  .stats-panel-title {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(245,240,232,0.3);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

  .stats-cell { text-align: center; }

  .stats-cell-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    color: var(--yellow);
    line-height: 1;
  }

  .stats-cell-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 1px;
    color: rgba(245,240,232,0.3);
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* ── NAV ── */
  .bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(8,8,8,0.96);
    backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 10px 0 22px;
    display: flex;
    justify-content: space-around;
    z-index: 50;
    max-width: 430px;
    margin: 0 auto;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    opacity: 0.35;
    transition: opacity 0.2s, transform 0.2s;
  }

  .nav-item:hover { opacity: 0.6; }
  .nav-item.active { opacity: 1; transform: translateY(-1px); }
  .nav-icon { font-size: 22px; }

  .nav-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 1.5px;
    color: rgba(245,240,232,0.6);
    text-transform: uppercase;
  }

  .nav-item.active .nav-label { color: var(--yellow); }
`;

// ─── OCCASIONS ────────────────────────────────────────────────────────────────
const OCCASIONS = {
  fr: ["📚 Lycée", "🎉 Soirée", "🛒 Casual", "💼 Entretien", "🎭 Événement", "🏃 Sport"],
  en: ["📚 School", "🎉 Party", "🛒 Casual", "💼 Interview", "🎭 Event", "🏃 Sport"],
};

const STYLES_VIBE = [
  { icon: "🖤", name: "Streetwear" },
  { icon: "💅", name: "Clean Girl" },
  { icon: "🌸", name: "Soft / Y2K" },
  { icon: "🏀", name: "Sport Luxe" },
  { icon: "🎨", name: "Artsy" },
  { icon: "🌍", name: "Afro Vibes" },
];

// ─── AI PROMPT ───────────────────────────────────────────────────────────────
const buildPrompt = (occasion, styleVibe, lang) => `
You are DRIP CHECK — the world's most culturally sharp AI style judge. You speak Gen Z fluently. Your job: analyze this outfit photo and deliver a verdict that feels like it came from the coolest, most honest friend in the room.

OCCASION: ${occasion}
STYLE VIBE CHOSEN: ${styleVibe || "Not specified"}
RESPONSE LANGUAGE: ${lang === "fr" ? "French (use Gen Z French slang: ouf, chelou, lourd, c'est chaud, c'est du lourd, tu gères, etc.)" : "English (use Gen Z slang: slay, lowkey, no cap, understood the assignment, it's giving, main character, fit check, fire, mid, understood, bussin, etc.)"}

CULTURAL REFERENCE POOL — pull from this world:
- Music/Artists: Beyoncé, Rihanna, Burna Boy, Davido, Wizkid, Aya Nakamura, Damso, Tiakola, Nicki Minaj, Cardi B, Tyler the Creator, A$AP Rocky, Pharrell, Bad Bunny, Rosalía, Central Cee, Drake, Travis Scott, Doja Cat, Sabrina Carpenter, Billie Eilish, SZA, Ice Spice
- Fashion Icons: Zendaya, Bella Hadid, Virgil Abloh era, streetwear culture, Balenciaga energy, thrift flip aesthetic
- Movies/Shows: Euphoria (Jules energy, Maddy energy, Rue energy), Wednesday, Squid Game, any iconic film character if relevant
- Memes & Internet: NPC vibes, main character energy, understood the assignment, ratio'd fit, slay queen, low-key heat, "it's giving [blank]", "the audacity", "we are not the same"
- Objects if outfit is very specific: banana, traffic cone, a lamp, a specific emoji, a piece of furniture

RULES — CRITICAL:
- NEVER comment on the person's body, face, weight, or any physical trait. ONLY the clothing choices.
- Be honest but never cruel. Roast with love. Think: best friend who won't lie to you.
- If the outfit is excellent → hype them UP unhinged. Make them feel like a superstar.
- If the outfit needs work → be funny about it but always give a concrete path forward.
- Keep it SHORT and punchy. No essays. Every word must slap.

Respond ONLY in valid JSON (no backticks, no markdown), exactly:
{
  "score": <integer 1-10>,
  "scoreClass": <"score-fire" if >=9, "score-good" if >=7, "score-mid" if >=5, "score-low" otherwise>,
  "emoji": <single emoji that captures the outfit energy>,
  "vibeTag": <3-6 punchy words, the vibe in a nutshell>,
  "verdict": <2-3 sentences max. Punchy. Use <strong> for emphasis. Culturally sharp. Language matches lang param>,
  "comparisonIcon": <emoji>,
  "comparisonName": <celebrity, character, object, or meme reference — be creative and specific>,
  "comparisonText": <1-2 sentences explaining the comparison with humor>,
  "refs": <array of 2-3 short cultural tags, e.g. ["Euphoria energy", "Virgil era", "Y2K revival"]>,
  "challenge": <one concrete actionable tip — specific piece to change, add, or swap>
}
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function DripCheck() {
  const [image, setImage]         = useState(null);
  const [occasion, setOccasion]   = useState(null);
  const [styleVibe, setStyleVibe] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [drag, setDrag]           = useState(false);
  const [lang, setLang]           = useState("fr");
  const [toast, setToast]         = useState(null);
  const [activeNav, setActiveNav] = useState("check");
  const [sessionStats, setSessionStats] = useState({ checks: 0, shares: 0, bestScore: 0 });
  const [loadMsg, setLoadMsg]     = useState("...");
  const fileRef = useRef();

  const LOAD_MSGS = {
    fr: ["ANALYSE EN COURS...", "SCAN DE LA TENUE...", "JUGEMENT IMMINENT...", "VERDICT QUI ARRIVE...", "L'IA RÉFLÉCHIT..."],
    en: ["ANALYSING FIT...", "SCANNING THE DRIP...", "JUDGMENT INCOMING...", "VERDICT LOADING...", "AI IS COOKING..."],
  };

  const OCCASIONS_LIST = OCCASIONS[lang];

  useEffect(() => {
    TRACKING.log("app_open", { lang });
  }, []);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setResult(null);
      TRACKING.log("photo_uploaded");
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image || !occasion) return;
    setLoading(true);
    setResult(null);
    TRACKING.log("analysis_started", { occasion, styleVibe, lang });

    let i = 0;
    const msgs = LOAD_MSGS[lang];
    const iv = setInterval(() => {
      setLoadMsg(msgs[i % msgs.length]);
      i++;
    }, 650);

    try {
      const mediaType = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const b64 = image.split(",")[1];

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
              { type: "text", text: buildPrompt(occasion, styleVibe, lang) }
            ]
          }]
        })
      });

      const data = await res.json();
      clearInterval(iv);
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setSessionStats(s => ({
        checks: s.checks + 1,
        shares: s.shares,
        bestScore: Math.max(s.bestScore, parsed.score)
      }));
      TRACKING.log("analysis_done", { score: parsed.score, occasion, lang });
    } catch (err) {
      clearInterval(iv);
      // Fallback
      const fb = {
        score: 7, scoreClass: "score-good", emoji: "🔥",
        vibeTag: lang === "fr" ? "Solide. T'as géré." : "Solid. You got it.",
        verdict: lang === "fr"
          ? "Ta tenue envoie du <strong>lourd</strong>. L'IA a eu un petit bug mais ton style, lui, bug pas."
          : "Your fit is <strong>actually fire</strong>. The AI glitched but your drip didn't.",
        comparisonIcon: "✨",
        comparisonName: lang === "fr" ? "Une version beta de toi-même" : "A beta version of yourself",
        comparisonText: lang === "fr" ? "En pleine mise à jour. Le update arrive." : "Still loading. The glow-up is coming.",
        refs: ["main character", "understood the assignment", "Y2K energy"],
        challenge: lang === "fr"
          ? "Ajoute une pièce statement — une veste, une bag, un bijou. Juste une."
          : "Add one statement piece — jacket, bag, or jewelry. Just one."
      };
      setResult(fb);
      setSessionStats(s => ({ ...s, checks: s.checks + 1 }));
    }

    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleShare = (platform) => {
    TRACKING.log("share_tapped", { platform, score: result?.score, lang });
    setSessionStats(s => ({ ...s, shares: s.shares + 1 }));
    const msg = lang === "fr"
      ? `✅ Lien copié ! Partage-le sur ${platform}`
      : `✅ Link copied! Share it on ${platform}`;
    showToast(msg);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setOccasion(null);
    setStyleVibe(null);
    TRACKING.log("reset");
  };

  const scoreClass = result?.scoreClass || "score-good";

  const T = {
    fr: {
      tagline: "L'IA qui juge ta tenue — no cap",
      uploadTitle: "BALANCE TA TENUE",
      uploadSub: "Photo ou selfie — L'IA te dit tout\n(elle ment jamais)",
      uploadBtn: "CHOISIR UNE PHOTO",
      changeBtn: "Changer",
      occasionLabel: "C'est pour quelle occasion ?",
      styleLabel: "Ton vibe habituel ?",
      analyzeBtn: "⚡ DRIP CHECK →",
      addPhoto: "📸 AJOUTE UNE PHOTO",
      chooseOcc: "👆 CHOISIS L'OCCASION",
      loading: loadMsg,
      retry: "🔄 Retry",
      share: "📤 Partager",
      scoreLabel: "DRIP SCORE",
      refsLabel: "REFS CULTURELLES",
      checksLabel: "CHECKS",
      sharesLabel: "PARTAGES",
      bestLabel: "BEST SCORE",
      statsTitle: "TA SESSION",
    },
    en: {
      tagline: "The AI that rates your fit — no cap",
      uploadTitle: "DROP YOUR FIT",
      uploadSub: "Photo or selfie — AI tells you everything\n(it never lies)",
      uploadBtn: "CHOOSE A PHOTO",
      changeBtn: "Change",
      occasionLabel: "What's the occasion?",
      styleLabel: "Your usual vibe?",
      analyzeBtn: "⚡ DRIP CHECK →",
      addPhoto: "📸 ADD A PHOTO",
      chooseOcc: "👆 PICK THE OCCASION",
      loading: loadMsg,
      retry: "🔄 Retry",
      share: "📤 Share",
      scoreLabel: "DRIP SCORE",
      refsLabel: "CULTURAL REFS",
      checksLabel: "CHECKS",
      sharesLabel: "SHARES",
      bestLabel: "BEST SCORE",
      statsTitle: "YOUR SESSION",
    }
  }[lang];

  return (
    <div className="app">
      <style>{STYLE}</style>
      <div className="noise" />

      {/* HEADER */}
      <div className="header">
        <div className="logo-wrap">
          <div className="logo">DRIP CHECK</div>
          <span className="logo-beta">BETA</span>
        </div>
        <div className="tagline">{T.tagline}</div>

        {/* session stats */}
        {sessionStats.checks > 0 && (
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val">{sessionStats.checks}</div>
              <div className="stat-label">{T.checksLabel}</div>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <div className="stat-val">{sessionStats.shares}</div>
              <div className="stat-label">{T.sharesLabel}</div>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <div className="stat-val">{sessionStats.bestScore}/10</div>
              <div className="stat-label">{T.bestLabel}</div>
            </div>
          </div>
        )}

        {/* lang toggle */}
        <div className="lang-row">
          {["fr", "en"].map(l => (
            <button key={l} className={`lang-btn${lang === l ? " active" : ""}`} onClick={() => { setLang(l); TRACKING.log("lang_switch", { to: l }); }}>
              {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
          ))}
        </div>
      </div>

      {/* UPLOAD / PREVIEW */}
      {!image ? (
        <div
          className={`upload-zone${drag ? " drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
        >
          <div className="upload-icon">📸</div>
          <div className="upload-title">{T.uploadTitle}</div>
          <div className="upload-sub" style={{ whiteSpace: "pre-line" }}>{T.uploadSub}</div>
          <button className="upload-btn" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>{T.uploadBtn}</button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="preview-wrap">
          <img src={image} alt="outfit" className="preview-img" />
          <div className="preview-overlay" />
          <button className="preview-change" onClick={reset}>{T.changeBtn}</button>
        </div>
      )}

      {/* OCCASION */}
      <div className="section">
        <div className="section-label">{T.occasionLabel}</div>
        <div className="pills">
          {OCCASIONS_LIST.map(o => (
            <button key={o} className={`pill${occasion === o ? " active" : ""}`} onClick={() => setOccasion(o)}>{o}</button>
          ))}
        </div>
      </div>

      {/* STYLE VIBE */}
      <div className="section">
        <div className="section-label">{T.styleLabel}</div>
        <div className="style-grid">
          {STYLES_VIBE.map(s => (
            <div key={s.name} className={`style-card${styleVibe === s.name ? " active" : ""}`} onClick={() => setStyleVibe(s.name)}>
              <span className="style-icon">{s.icon}</span>
              <span className="style-name">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ANALYZE */}
      {!result && !loading && (
        <button className="analyze-btn" disabled={!image || !occasion} onClick={analyze}>
          {!image ? T.addPhoto : !occasion ? T.chooseOcc : T.analyzeBtn}
        </button>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading-wrap">
          <div className="loading-emoji">⚡</div>
          <div className="loading-text">{T.loading}</div>
          <div className="loading-bar"><div className="loading-progress" /></div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <>
          <div className="result-card">
            <div className="result-top">
              <div>
                <div className="score-label">{T.scoreLabel}</div>
                <div className={`score-num ${scoreClass}`}>{result.score}</div>
              </div>
              <div className="vibe-side">
                <div className="vibe-emoji">{result.emoji}</div>
                <div className="vibe-tag">{result.vibeTag}</div>
              </div>
            </div>

            <div className="divider" />

            <div className="verdict" dangerouslySetInnerHTML={{ __html: result.verdict }} />

            {/* Cultural refs */}
            {result.refs?.length > 0 && (
              <div className="refs-row" style={{ marginTop: 12 }}>
                {result.refs.map((r, i) => <span key={i} className="ref-tag">#{r}</span>)}
              </div>
            )}

            <div className="comparison">
              <div className="comp-icon">{result.comparisonIcon}</div>
              <div className="comp-body">
                <span className="comp-name">{result.comparisonName}</span>
                <span className="comp-text">{result.comparisonText}</span>
              </div>
            </div>

            <div className="challenge">
              <span className="challenge-icon">🎯</span>
              <span>{result.challenge}</span>
            </div>
          </div>

          {/* SHARE */}
          <div className="share-row">
            <button className="share-btn" onClick={reset}>{T.retry}</button>
            <button className="share-btn tiktok" onClick={() => handleShare("TikTok")}>
              ♪ TikTok
            </button>
            <button className="share-btn insta" onClick={() => handleShare("Instagram")}>
              📸 Story
            </button>
          </div>

          {/* SESSION STATS */}
          <div className="stats-panel">
            <div className="stats-panel-title">{T.statsTitle}</div>
            <div className="stats-grid">
              <div className="stats-cell">
                <div className="stats-cell-val">{sessionStats.checks}</div>
                <div className="stats-cell-label">{T.checksLabel}</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-val">{sessionStats.shares}</div>
                <div className="stats-cell-label">{T.sharesLabel}</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-val">{sessionStats.bestScore}/10</div>
                <div className="stats-cell-label">{T.bestLabel}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}

      {/* NAV */}
      <div className="bottom-nav">
        {[
          { id: "check", icon: "⚡", label: "CHECK" },
          { id: "wardrobe", icon: "👗", label: lang === "fr" ? "GARDE-ROBE" : "WARDROBE" },
          { id: "feed", icon: "🔥", label: "FEED" },
          { id: "profile", icon: "👤", label: lang === "fr" ? "MOI" : "ME" },
        ].map(n => (
          <div key={n.id} className={`nav-item${activeNav === n.id ? " active" : ""}`} onClick={() => setActiveNav(n.id)}>
            <div className="nav-icon">{n.icon}</div>
            <div className="nav-label">{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
