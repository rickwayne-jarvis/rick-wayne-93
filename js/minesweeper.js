/* minesweeper.js - classic Minesweeper */

(function () {
  const RW = window.RW = window.RW || {};
  const MS = RW.Minesweeper = {};

  const DIFFICULTIES = {
    beginner:     { w: 9,  h: 9,  mines: 10 },
    intermediate: { w: 16, h: 16, mines: 40 },
    expert:       { w: 30, h: 16, mines: 99 }
  };
  let currentDiff = 'beginner';
  let useMarks = true;

  let state = null;
  let domRefs = null;

  MS.open = function (diff) {
    if (diff) currentDiff = diff;
    const winId = 'minesweeper';
    if (RW.WM.get(winId)) { RW.WM.bringToFront(winId); newGame(); return; }

    const wrap = document.createElement('div');
    wrap.className = 'ms-body';
    wrap.innerHTML =
      '<div class="ms-menu">' +
        '<span class="mb-item" data-m="game"><u>G</u>ame' +
          '<div class="mb-sub">' +
            '<div data-act="new">New</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="d-beginner">Beginner</div>' +
            '<div data-act="d-intermediate">Intermediate</div>' +
            '<div data-act="d-expert">Expert</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="marks" class="' + (useMarks ? 'checked' : '') + '">Marks (?)</div>' +
            '<div data-act="colors" class="checked">Color</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="best">Best Times...</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-m="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="about">About Minesweeper</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="ms-frame">' +
        '<div class="ms-header">' +
          '<div class="ms-lcd" data-lcd="mines">010</div>' +
          '<button class="ms-smiley" data-smile>:)</button>' +
          '<div class="ms-lcd" data-lcd="time">000</div>' +
        '</div>' +
        '<div class="ms-grid" data-grid></div>' +
      '</div>';

    const w = RW.WM.open({
      id: winId,
      title: 'Minesweeper',
      icon: RW.ICONS.mine,
      width: 420, height: 480, resizable: false,
      contentNode: wrap
    });
    w.body.style.padding = '0';

    domRefs = {
      wrap: wrap,
      grid: wrap.querySelector('[data-grid]'),
      mines: wrap.querySelector('[data-lcd=mines]'),
      time: wrap.querySelector('[data-lcd=time]'),
      smile: wrap.querySelector('[data-smile]')
    };

    // Menu wiring
    wrap.querySelectorAll('.ms-menu .mb-item').forEach(mb => {
      mb.addEventListener('click', (e) => {
        wrap.querySelectorAll('.ms-menu .mb-item').forEach(x => { if (x !== mb) x.classList.remove('open'); });
        mb.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      wrap.querySelectorAll('.ms-menu .mb-item').forEach(x => x.classList.remove('open'));
    });
    wrap.querySelectorAll('.ms-menu .mb-sub div').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = d.dataset.act;
        wrap.querySelectorAll('.ms-menu .mb-item').forEach(x => x.classList.remove('open'));
        if (act === 'new') newGame();
        else if (act === 'd-beginner') { currentDiff = 'beginner'; resizeAndNew(); }
        else if (act === 'd-intermediate') { currentDiff = 'intermediate'; resizeAndNew(); }
        else if (act === 'd-expert') { currentDiff = 'expert'; resizeAndNew(); }
        else if (act === 'marks') { useMarks = !useMarks; d.classList.toggle('checked'); }
        else if (act === 'best') openBest();
        else if (act === 'exit') RW.WM.close(winId);
        else if (act === 'about') openAbout();
      });
    });

    domRefs.smile.addEventListener('click', () => { newGame(); });
    domRefs.smile.addEventListener('mousedown', () => { if (state && !state.over && !state.won) setSmile('O'); });
    document.addEventListener('mouseup', () => {
      if (state && !state.over && !state.won) setSmile(':)');
    });

    resizeAndNew();
  };

  // v8: detect touch devices the same way the rest of the OS does.
  function isTouchDevice() {
    if (window.RW_TOUCH) return true;
    if ('ontouchstart' in window) return true;
    return (navigator.maxTouchPoints || 0) > 0;
  }

  function resizeAndNew() {
    const cfg = DIFFICULTIES[currentDiff];
    const win = RW.WM.get('minesweeper');
    if (win && !isTouchDevice()) {
      // Desktop: re-size container based on grid (classic Minesweeper feel).
      const w = 24 + cfg.w * 18 + 24;
      const h = 130 + cfg.h * 18;
      win.el.style.width = (w + 16) + 'px';
      win.el.style.height = (h + 60) + 'px';
    }
    // v8: on touch devices the window manager already opens fullscreen and
    // we leave it that way. The cell grid is scaled in renderGrid() instead
    // so the board fits the available width.
    newGame();
  }

  function newGame() {
    const cfg = DIFFICULTIES[currentDiff];
    state = {
      w: cfg.w, h: cfg.h, mines: cfg.mines,
      cells: [], started: false, over: false, won: false,
      time: 0, flagsPlaced: 0, revealed: 0, timerId: null
    };
    // empty cells
    for (let r = 0; r < cfg.h; r++) {
      const row = [];
      for (let c = 0; c < cfg.w; c++) {
        row.push({ mine: false, n: 0, revealed: false, flag: false, q: false });
      }
      state.cells.push(row);
    }
    renderGrid();
    updateLCDs();
    setSmile(':)');
  }

  function placeMines(excludeR, excludeC) {
    const { w, h, mines } = state;
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * h);
      const c = Math.floor(Math.random() * w);
      if (state.cells[r][c].mine) continue;
      // first click safe: avoid 3x3 around it
      if (Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1) continue;
      state.cells[r][c].mine = true;
      placed++;
    }
    // compute neighbor counts
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (state.cells[r][c].mine) continue;
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
          if (state.cells[nr][nc].mine) n++;
        }
        state.cells[r][c].n = n;
      }
    }
  }

  function renderGrid() {
    const grid = domRefs.grid;
    grid.innerHTML = '';

    // v8: compute a cell size that fits the available width on touch
    // devices. The board never goes wider than the window. The minimum
    // tap target stays comfortable across all three difficulties.
    let cellSize = 18;
    if (isTouchDevice()) {
      const win = RW.WM.get('minesweeper');
      // Inner padding inside the .ms-frame (12px each side) plus a small
      // margin for safety. Falls back to the viewport width if we can't
      // measure the window yet.
      const winWidth = (win && win.el && win.el.clientWidth) ? win.el.clientWidth : window.innerWidth;
      const padding = 48;
      const availWidth = Math.max(160, winWidth - padding);
      const cap = currentDiff === 'beginner'     ? 48
                : currentDiff === 'intermediate' ? 32
                : 24;
      cellSize = Math.max(20, Math.min(cap, Math.floor(availWidth / state.w)));
    }

    grid.style.gridTemplateColumns = 'repeat(' + state.w + ', ' + cellSize + 'px)';
    for (let r = 0; r < state.h; r++) {
      for (let c = 0; c < state.w; c++) {
        const cell = state.cells[r][c];
        const div = document.createElement('div');
        div.className = 'ms-cell';
        div.dataset.r = r; div.dataset.c = c;
        if (cellSize !== 18) {
          div.style.width = cellSize + 'px';
          div.style.height = cellSize + 'px';
          div.style.lineHeight = cellSize + 'px';
          // Number font scales with cell size so 1-8 stay readable but
          // never overflow.
          div.style.fontSize = Math.max(11, Math.floor(cellSize * 0.55)) + 'px';
        }
        attachCellHandlers(div);
        grid.appendChild(div);
      }
    }
  }

  function attachCellHandlers(div) {
    div.addEventListener('contextmenu', (e) => e.preventDefault());
    div.addEventListener('mousedown', (e) => {
      if (state.over || state.won) return;
      if (e.button === 2) {
        // right
        cycleFlag(+div.dataset.r, +div.dataset.c);
      } else if (e.button === 1 || (e.button === 0 && e.buttons === 3) || (e.button === 0 && e.shiftKey)) {
        // middle or chord
        chord(+div.dataset.r, +div.dataset.c);
      } else if (e.button === 0) {
        if (e.buttons === 3) { chord(+div.dataset.r, +div.dataset.c); return; }
        setSmile('O');
      }
    });
    div.addEventListener('mouseup', (e) => {
      if (state.over || state.won) return;
      if (e.button === 0) {
        reveal(+div.dataset.r, +div.dataset.c);
      }
      setSmile(state.won ? '8)' : (state.over ? 'X(' : ':)'));
    });

    // v7 touch: long-press cycles the flag. A normal tap still reveals.
    let touchTimer = null;
    let touchFlagged = false;
    div.addEventListener('touchstart', (e) => {
      if (!window.RW_TOUCH || state.over || state.won) return;
      touchFlagged = false;
      setSmile('O');
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(() => {
        touchFlagged = true;
        cycleFlag(+div.dataset.r, +div.dataset.c);
        setSmile(':)');
        // haptic-ish feedback via the click sound
        if (RW.Audio) RW.Audio.click();
      }, 450);
    }, { passive: true });
    div.addEventListener('touchend', (e) => {
      if (!window.RW_TOUCH) return;
      if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      if (state.over || state.won) return;
      if (touchFlagged) {
        touchFlagged = false;
        e.preventDefault();
        return;
      }
      reveal(+div.dataset.r, +div.dataset.c);
      setSmile(state.won ? '8)' : (state.over ? 'X(' : ':)'));
      e.preventDefault();
    });
    div.addEventListener('touchcancel', () => {
      if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      touchFlagged = false;
    });
  }

  function startTimer() {
    if (state.timerId) return;
    state.timerId = setInterval(() => {
      state.time = Math.min(999, state.time + 1);
      updateLCDs();
    }, 1000);
  }
  function stopTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }

  function reveal(r, c) {
    if (!inBounds(r, c)) return;
    const cell = state.cells[r][c];
    if (cell.revealed || cell.flag) return;

    if (!state.started) {
      placeMines(r, c);
      state.started = true;
      startTimer();
    }

    // flood fill iterative
    const stack = [[r, c]];
    while (stack.length) {
      const [rr, cc] = stack.pop();
      const cl = state.cells[rr][cc];
      if (cl.revealed || cl.flag) continue;
      cl.revealed = true;
      state.revealed++;
      paintCell(rr, cc);
      if (cl.mine) {
        explode(rr, cc);
        return;
      }
      if (cl.n === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = rr + dr, nc = cc + dc;
          if (!inBounds(nr, nc)) continue;
          const ncell = state.cells[nr][nc];
          if (!ncell.revealed && !ncell.flag) stack.push([nr, nc]);
        }
      }
    }
    if (RW.Audio) RW.Audio.minesweeperReveal();
    checkWin();
  }

  function cycleFlag(r, c) {
    const cell = state.cells[r][c];
    if (cell.revealed) return;
    if (cell.flag) {
      cell.flag = false;
      if (useMarks) { cell.q = true; }
      state.flagsPlaced--;
    } else if (cell.q) {
      cell.q = false;
    } else {
      cell.flag = true;
      state.flagsPlaced++;
    }
    paintCell(r, c);
    updateLCDs();
    if (RW.Audio) RW.Audio.click();
  }

  function chord(r, c) {
    const cell = state.cells[r][c];
    if (!cell.revealed || cell.n === 0) return;
    let flags = 0;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const nc2 = state.cells[nr][nc];
      if (nc2.flag) flags++;
      else if (!nc2.revealed) neighbors.push([nr, nc]);
    }
    if (flags === cell.n) {
      neighbors.forEach(([nr, nc]) => reveal(nr, nc));
    }
  }

  function explode(r, c) {
    state.over = true;
    stopTimer();
    // mark exploded cell red
    paintCell(r, c, { exploded: true });
    // reveal all mines and wrong flags
    for (let rr = 0; rr < state.h; rr++) for (let cc = 0; cc < state.w; cc++) {
      const cl = state.cells[rr][cc];
      if (cl.mine && !cl.flag) { cl.revealed = true; paintCell(rr, cc); }
      else if (!cl.mine && cl.flag) { paintCell(rr, cc, { wrongFlag: true }); }
    }
    setSmile('X(');
    if (RW.Audio) RW.Audio.minesweeperBoom();
  }

  function checkWin() {
    const total = state.w * state.h;
    if (state.revealed >= total - state.mines) {
      state.won = true;
      stopTimer();
      // auto-flag remaining mines
      for (let r = 0; r < state.h; r++) for (let c = 0; c < state.w; c++) {
        const cl = state.cells[r][c];
        if (cl.mine && !cl.flag) { cl.flag = true; state.flagsPlaced++; paintCell(r, c); }
      }
      updateLCDs();
      setSmile('8)');
      if (RW.Audio) RW.Audio.minesweeperWin();
      if (RW.Easter && RW.Easter.markMinesweeperWin) RW.Easter.markMinesweeperWin();
    }
  }

  function paintCell(r, c, opts) {
    opts = opts || {};
    const idx = r * state.w + c;
    const div = domRefs.grid.children[idx];
    if (!div) return;
    const cell = state.cells[r][c];
    div.className = 'ms-cell';
    div.innerHTML = '';
    if (cell.revealed) {
      div.classList.add('revealed');
      if (cell.mine) {
        div.classList.add('mine');
        if (opts.exploded) div.classList.add('exploded');
        div.textContent = '*';
      } else if (cell.n > 0) {
        div.classList.add('ms-n' + cell.n);
        div.textContent = cell.n;
      }
    } else {
      if (cell.flag) {
        div.innerHTML = '<span class="flag">&#9873;</span>';
      } else if (cell.q) {
        div.innerHTML = '<span class="q">?</span>';
      }
      if (opts.wrongFlag) {
        div.classList.add('revealed');
        div.innerHTML = '<span class="wrong-flag">&#9873;</span>';
      }
    }
  }

  function setSmile(s) {
    if (!domRefs) return;
    domRefs.smile.textContent = s;
  }

  function updateLCDs() {
    domRefs.mines.textContent = pad3(state.mines - state.flagsPlaced);
    domRefs.time.textContent = pad3(state.time);
  }

  function pad3(n) {
    const neg = n < 0;
    n = Math.abs(n);
    const s = String(n).padStart(3, '0').slice(0, 3);
    return neg ? '-' + s.slice(1) : s;
  }

  function inBounds(r, c) { return r >= 0 && c >= 0 && r < state.h && c < state.w; }

  function openBest() {
    const html = '<div class="dialog-body"><p><b>Best Times</b></p>' +
      '<p>Beginner:     001  - Rick</p>' +
      '<p>Intermediate: 042  - Rick</p>' +
      '<p>Expert:       127  - Rick</p>' +
      '<p style="font-size:11px;color:#666">Times are aspirational.</p>' +
      '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Fastest Mine Sweepers', icon: RW.ICONS.mine,
      width: 320, height: 220, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }
  function openAbout() {
    const html = '<div class="dialog-body"><p><b>Minesweeper</b></p>' +
      '<p>Version 3.10 (Rick Wayne edition)</p>' +
      '<p>Left click to reveal. Right click to flag. Middle click or both buttons to chord.</p>' +
      '<p>(c) 1995-2026 Rick Wayne.</p>' +
      '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'About Minesweeper', icon: RW.ICONS.mine,
      width: 360, height: 220, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }
})();
