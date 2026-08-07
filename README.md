# Logopedia Rush

A browser-based time-management game set in a speech therapy clinic. Manage a queue of patients, prepare the right exercises, and deliver them before each patient's patience runs out.

## How to Play

1. Open `index.html` in any modern browser — no build step required.
2. Click **Start Day** to begin the 60-second session.
3. **Prepare exercises** by clicking one of the three buttons (or use keyboard shortcuts):
   - `1` — Articulation (5 s prep, 12 pts)
   - `2` — Fluency (6 s prep, 14 pts)
   - `3` — Voice (4 s prep, 10 pts)
4. Once an exercise slot shows **Ready**, **drag** it onto the matching patient card in the queue.
5. A correct match scores points and removes the patient. A wrong match deducts 6 points and drains that patient's patience.
6. Patients who run out of patience leave on their own, costing 10 points.
7. Reach the **daily target score** before time runs out. Each new session increases the target by 10%.

Press `P` to pause/resume at any time.

## Project Structure

```
├── index.html   # Game UI and layout
├── game.js      # Game logic (state, loop, patient/prep management)
└── styles.css   # Pixel-art inspired styles
```

## Running Locally

Just open `index.html` directly in a browser — no server or dependencies needed.

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

## Tech Stack

- Vanilla HTML, CSS, and JavaScript
- No frameworks or build tools
- `requestAnimationFrame` game loop with delta-time ticking
