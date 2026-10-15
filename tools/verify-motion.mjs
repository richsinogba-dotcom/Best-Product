/* Verifies the motion layer with prefers-reduced-motion forced to "no-preference".
   The headless Chrome used by inspect.mjs defaults to "reduce", so its still-page
   and reveal measurements are taken with the whole motion layer switched off.
   This script re-measures it as a real visitor would see it, and reports which
   pictures overlap the pinned clause in the scrub section.
   Run: node tools/verify-motion.mjs                                             */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import {
  Browser,
  sleep,
} from "file:///C:/Users/user/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";
import { frame } from "file:///C:/Users/user/.agents/skills/design-taste-frontend/scripts/lib/probe.mjs";

const ROOT = resolve(process.argv[2] || ".");
const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  const f = p.endsWith("/") ? join(p, "index.html") : p;
  if (!existsSync(f)) {
    res.writeHead(404);
    return res.end("nope");
  }
  res.writeHead(200, {
    "Content-Type": TYPES[extname(f)] || "application/octet-stream",
  });
  res.end(readFileSync(f));
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const RECORDER = `(() => {
  const seen = new WeakSet(); const c = { elements: 0 };
  addEventListener('animationstart', (e) => { if (!seen.has(e.target)) { seen.add(e.target); c.elements++; } }, true);
  addEventListener('transitionrun', (e) => { if (!seen.has(e.target)) { seen.add(e.target); c.elements++; } }, true);
  window.__motion = () => {
    for (const a of document.getAnimations ? document.getAnimations() : []) { const t = a.effect && a.effect.target; if (t && !seen.has(t)) { seen.add(t); c.elements++; } }
    const v = [...document.querySelectorAll('video')];
    return { ...c, videos: v.length, playing: v.filter(x => x.autoplay || !x.paused).length };
  };
})();`;

const browser = await Browser.launch();
const page = await browser.newPage({ width: 1440, height: 900 });
// the whole point: turn reduced motion OFF, as a normal visitor has it
await page.send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
});
await page.send("Page.addScriptToEvaluateOnNewDocument", { source: RECORDER });
await page.goto(url, { settleMs: 1400 });

const reduced = await page.eval(
  `matchMedia('(prefers-reduced-motion: reduce)').matches`,
);
console.log(
  "prefers-reduced-motion:reduce  ->",
  reduced,
  reduced ? "(inspect.mjs sees THIS)" : "",
);

const H = 900;
const total = await page.eval("document.body.scrollHeight");
const screens = Math.min(14, Math.ceil(total / H) - 1);
const pinned = [];
for (let i = 0; i <= screens; i++) {
  await page.eval(`window.scrollTo({ top: ${i * H}, behavior: 'instant' })`);
  await page.wheel(2);
  await sleep(620);
  const f = await page.eval(frame).catch(() => null);
  if (f?.pinnedOver?.length) {
    const who = await page.eval(`(() => {
      const big = [...document.querySelectorAll('p,blockquote')].find(p => (p.innerText||'').trim().startsWith(${JSON.stringify(f.pinnedOver[0].text.slice(0, 24))}));
      if (!big) return null;
      const r = big.getBoundingClientRect();
      const pics = [...document.querySelectorAll('img,video,canvas,picture,svg')].map(m => ({ m, r: m.getBoundingClientRect() }));
      const hits = pics.filter(({ m, r: pr }) => !(m.contains(big) || big.contains(m)) && Math.min(r.right,pr.right) > Math.max(r.left,pr.left) && Math.min(r.bottom,pr.bottom) > Math.max(r.top,pr.top));
      return hits.map(({ m, r: pr }) => m.tagName + '.' + (m.className.baseVal ?? m.className ?? '').toString().split(' ')[0] + ' @' + Math.round(pr.left) + ',' + Math.round(pr.top) + ' ' + Math.round(pr.width) + 'x' + Math.round(pr.height)).slice(0,4);
    })()`);
    pinned.push({
      screen: i + 1,
      text: f.pinnedOver[0].text,
      share: f.pinnedOver[0].share,
      overlapping: who,
    });
  }
}

const m = await page.eval("window.__motion()");
console.log(
  "\nMOVING ELEMENTS (full motion):",
  m.elements,
  "+ videos playing",
  m.playing,
  "=",
  m.elements + m.playing * 4,
  "  [gate needs >= 16]",
);
console.log("\nPINNED-OVER-PICTURE detail:");
for (const p of pinned)
  console.log(
    " screen",
    p.screen,
    JSON.stringify(p.text),
    p.share,
    "->",
    (p.overlapping || []).join(" | "),
  );

await browser.close();
server.close();
