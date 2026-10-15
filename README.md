# Best Product

> Write a shot. Get twelve finished takes in forty-one seconds.

**Best Product** (formerly *Parallax*) is a single-page marketing site for a fictional AI motion-generation product. It is built entirely as **static HTML, CSS, and JavaScript** — no build step, no framework, no bundler.

## Project layout

```
.
├── index.html          # the whole document (sections, footer wordmark)
├── css/
│   └── style.css       # design tokens, layout, responsive breakpoints
├── js/
│   └── main.js         # hero rotation, contact sheet, prompt match, scrub, dialog, motion switch, drawer
├── media/              # local stock clips (.mp4) and posters (.jpg), fully self-contained
├── tools/
│   └── fetch-media.ps1 # original media fetcher (Windows PowerShell)
├── .taste-skill/       # saved design-inspect screenshots and report (not runtime)
└── README.md
```

## Run it

No build required.

**Option A — direct:** double-click `index.html`. All media is local, so it works offline.

**Option B — local server (recommended, avoids any file:// quirks):**

```sh
cd "path/to/Best Product"
python -m http.server 8765   # Python 3
# -> http://127.0.0.1:8765/index.html
```

## Features

- **Hero** with four looping film clips that rotate every 6.8s; drift parallax on the shot field.
- **Contact sheet** — 12 takes of one prompt. Hover/focus previews a take in the sticky player; click (or arrow keys) pin it. `aria-live` announces the readout.
- **Prompt matcher** — typing a shot description with keywords ("forest", "rain", "smoke", "neon"…) runs a 1.5s progress animation and selects the best matching take.
- **Scrub section** — 280svh of scroll-driven video scrubbing, plus a keyboard-operable 28px-tall range input.
- **Plans, FAQ, Start, footer** — full pricing matrix (monthly / annual / overage), accordion-like accessible Q&A, workspace sign-up dialog.
- **Motion switch** (nav) — one control stops every autoplaying video and freezes every animation, honoring `prefers-reduced-motion` and persisting the choice in `localStorage`.
- **Mobile drawer** (< 860px) with focus trap, Escape close, and body scroll lock (no global navigation was present before).
- **No-JS fallback** — the gallery renders as 12 static stills instead of an empty list.

## Accessibility baseline

- Skip link; sticky nav cleared by `scroll-margin-top` on anchors.
- Real `<button>`/`<input type="radio">` elements instead of styled spans; `aria-pressed`/`aria-checked`/`aria-busy`/`aria-live`.
- Restored `:focus-visible` rings on all form inputs (no `outline: none`).
- Scrub slider meets 24×24 touch-target minimum (WCAG 2.5.8).
- `--faint` tuned to ≈5.5:1 on the dark background; `--muted` and plan text clear 7:1.
- Every previously hidden `display: none` auto-select has been replaced with `hidden` + labelled controls.

## Brand

- Display: **Boska** (Fontshare), served from `api.fontshare.com`.
- Palette: warm black `#0c0a08`, surface `#181512`, gold accent `#c9a45a`, ink on the footer `#fff`.
- All metrics, prices and footage are **sample content** — the footer says so explicitly.

## Media credits

Every clip is free stock from <https://coverr.co>, used under their licence. The fetcher in `tools/fetch-media.ps1` is the original source tooling.

## Notes

- The `.taste-skill/` directory contains saved design-inspection screenshots and the resulting audit. They are not used at runtime and can be deleted freely.
- `media/*.mp4` are committed; if you replace them, keep the poster `.jpg` alongside and update the `CLIPS` array in `js/main.js`.

## License

Site code: sample/educational. Footage © Coverr contributors, used under licence. Every plan, price and figure on the page is sample content.