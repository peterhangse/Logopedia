# CONTEXT.md — Logopedia ("Logopedia Rush")

**"Logopedia Rush"** — logopedmottagnings-minigame för barn (5–10 år):
60-sekunders köhantering i mottagningen. Patienten står i kö och ber om en av tre
övningar; spelaren förbereder dem och drar rätt övning till rätt patient.

**Teknik (verifierat — korrigerar gamla uppgifter):** ren **vanilla JS (ingen
Phaser, ingen buntare, ingen Firebase, inga assets)** — `index.html` + `game.js`
(hela logiken) + `styles/` (10 CSS, box-shadow pixel-art + HTML-enheter).
Ingen byggserver: `python3 -m http.server` räcker. UI-språk: **engelska** (trots
svensk målgrupp). Fonts refererade men aldrig laddade (= fallback till monospace).

## Struktur

- `index.html` (103 r) — markup + knappar + keyboardhimlarna 1/2/3, `P` paus.
- `game.js` (512 r) — allt: `DOMContentLoaded` → `resetDay()` → `requestAnimationFrame`
  loop (`tick(dt)`, dt klampat 0.1 s). Inga bibliotek, ingen canvas.
- `styles.css` + `style/` — 10 temafiler.

## Mekanik

- 3 övningstyper: **Articulation** (5 s prep, 12 p), **Fluency** (6 s, 14 p),
  **Voice** (4 s, 10 p).
- Klick på övning fyller en av **3 prep-platser** (idle → countdown → ready).
- Patienter spawnar var 3–6:e s i kö (max 5), var och en med random övning och en
  **tålamodsbar som töms 6/st**.
- **Drag & drop** ready övning på rätt patient: rätt → +poäng; fel → −6 poäng och
  −20 tålamod. Patient som når 0 tålamod lämnar och kostar −10. Poäng golvare 0.
- Dag slutar 00:00 → resultat; "New Session" = dag+1 med mål ×1.1 (dag 1 = 60).
- Tema: upprepning + positiv feedback, inte tävling. 10 patientnamn, CSS-variationer,
  3 humör (patience<60 tired, <30 angry).

## Köra

- `python3 -m http.server 8000` (via .fabrik) och öppna i webbläsaren.
- Git-repo men ingen live-sida deployad (inga arbetsflöden) — deploy görs i så fall
  manuellt via `firebase deploy`, men `firebase.json` saknas i repot.

## Regler

- Håll texten kort och tydlig (målgrupp = barn 5–10), abstrakta instruktioner undviks.