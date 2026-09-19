# AGENTS.md — Logopedia ("Logopedia Rush")

**Läs `CONTEXT.md` först.** Spelet är en liten vanilla-JS-sak — hela logiken
ligger i `game.js` (512 rader).

## Kontrakt

- Ändrar du mekanik eller struktur: **uppdatera `CONTEXT.md` i samma commit**
  som ändringen.
- Ren vanilla JS + CSS pixel-art. **Ingen Phaser, ingen buntare, ingen
  Firebase** — lägg inte till byggsteg utan anledning.
- Balans (prep-tider/poäng/tålamod) ligger antingen i `game.js` eller CSS —
  sök innan du antar.
- Målgruppen är barn 5–10 år: kort, tydlig text, ingen abstrakt instruktionsspråk.
- Köra lokalt: `python3 -m http.server 8000`.