# Rock Paper Scissors for PewPlay

This directory contains the original static game adapted for the PewPlay game template. Open `index.html` to play.

`game.json` holds the game page text. `preview.png` and `cover.png` provide the page images. The PewPlay workflow checks pushes to `preview` and `main`.

Game controls: choose rock, paper or scissors (click, tap or R/P/S keys) and compare your choice with the house. Keep playing to improve your score.

## October 2026 update
- Layout rebuilt with flexbox/grid and container-query sizing instead of fixed pixel margins: big touch-friendly tokens that fill the screen in portrait, landscape, tablet and desktop; duel screen with house "shuffle", winner glow and clear result.
- Removed the Google Fonts request (external): Poppins is now bundled locally as a small subset (OFL, see assets/fonts/FONTS-LICENSE.txt). Removed unused fonts.eot / fonts.svg.
- Added wins / losses / draws / streak / best streak, saved with the score in localStorage under `sasso-carta-forbici:stats` (no previous keys existed). Reset with an in-page two-step button in the Rules panel.
- Keyboard: R/P/S or 1/2/3, Enter/Space to play again, Esc to close the rules.
- New cover and screenshots; preview kept.
