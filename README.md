# rick-wayne-93

A Windows 9x-style portfolio prototype for Rick Wayne, director.
Boot screen, draggable windows, retro pixel UI, sound that defaults to off.

This is a **prototype** for an A/B vibe test against the real site at
[rickwayne.cc](https://rickwayne.cc). The real site stays untouched.

## What is here

- `index.html` - single page, all the layout lives here.
- `assets/styles.css` - the Windows 9x chrome, vanilla CSS.
- `assets/main.js` - boot sequence, desktop, start menu, easter egg.
- `assets/windows.js` - the windowing system: drag, resize, focus, close, minimize, maximize, taskbar.
- `assets/sound.js` - Web Audio synthesized chimes. No binary audio shipped.
- `assets/projects.js` - inlined project data, mirrored from `content/rickwayne-cc-snapshot.json`.
- `content/rickwayne-cc-snapshot.json` - the read-only snapshot from rickwayne.cc.
- `CREDITS.md` - fonts, sources, attributions.

## Stack

- Vanilla HTML, CSS, JS. No build step, no framework, no bundler.
- Loadable from `file://`.
- Web Audio for sound (no binaries).
- VT323 and Press Start 2P from Google Fonts (SIL OFL 1.1).

## Run locally

Just open `index.html` in any modern browser. That is the whole step.

## Deploy

The repo is set up for GitHub Pages on `main`.

## What is built (v1)

- Boot screen with fake POST.
- Desktop with a project icon per client, plus My Reels, About Me, Contact, Press, Recycle Bin.
- Taskbar with Start button, open windows, sound toggle, real clock.
- Draggable, resizable, closable windows. Multiple open at once. Stacked z-index. Focus on click.
- Fully built project window for **Sharpie ROTY** and **Graco** (reel embed, scoreboard, copy).
- All other project icons open a friendly "under construction" window so the windowing system gets exercised on every icon.
- Reels folder shows all projects in a thumbnail grid.
- Easter egg: type `rick` anywhere for a fake BSOD that dismisses with humor.
- Recycle Bin can be dragged around the desktop. Double-click it for a small joke.
- Mobile: a polite "open this on desktop" card. No attempt to cram Win95 onto a phone.

## What is NOT built (yet)

- Full case study windows for the rest of the projects.
- Window snap, minimize-to-task animation, real drag-drop between windows.
- Sound switched on by default. Default-off is a deliberate politeness call.

## Why this exists

To find out, in the cheapest possible way, whether the "early-web OS as portfolio"
direction lands with people who hire directors. If it does, the prototype gets fleshed out
and we make a decision about replacing rickwayne.cc. If it doesn't, no harm done.
