/* calculator.js - Win95 Calculator (Standard) */

(function () {
  const RW = window.RW = window.RW || {};
  const Calc = RW.Calculator = {};
  const ICONS = RW.ICONS;

  const ID = 'calculator';

  // Round to 16 significant digits and strip trailing zeros.
  function formatNumber(n) {
    if (!isFinite(n)) return 'Error';
    if (Number.isNaN(n)) return 'Error';
    if (n === 0) return '0.';
    const abs = Math.abs(n);
    let s;
    if (abs >= 1e16 || (abs > 0 && abs < 1e-15)) {
      s = n.toExponential(15);
    } else {
      s = n.toPrecision(16);
      if (s.indexOf('.') >= 0) {
        s = s.replace(/0+$/, '').replace(/\.$/, '.');
      }
      // Make sure it ends with a dot (authentic Win95 look) if integer
      if (s.indexOf('.') < 0 && s.indexOf('e') < 0) s = s + '.';
    }
    return s;
  }

  function parseDisplay(s) {
    if (s === 'Error') return NaN;
    return parseFloat(s);
  }

  Calc.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    const wrap = document.createElement('div');
    wrap.className = 'calc-body';

    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item" data-menu="edit"><u>E</u>dit' +
          '<div class="mb-sub">' +
            '<div data-act="copy">Copy</div>' +
            '<div data-act="paste">Paste</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="view"><u>V</u>iew' +
          '<div class="mb-sub">' +
            '<div data-act="standard"><span class="check">&#10003;</span> Standard</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="about">About Calculator</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="calc-display"><div class="calc-display-text" id="calc-disp">0.</div></div>' +
      '<div class="calc-keys">' +
        '<div class="calc-row r-mem-clear">' +
          '<button class="k-empty"></button>' +
          '<button class="k k-clear" data-k="bk">Backspace</button>' +
          '<button class="k k-clear" data-k="ce">CE</button>' +
          '<button class="k k-clear" data-k="c">C</button>' +
        '</div>' +
        '<div class="calc-row">' +
          '<button class="k k-mem" data-k="mc">MC</button>' +
          '<button class="k k-num" data-k="7">7</button>' +
          '<button class="k k-num" data-k="8">8</button>' +
          '<button class="k k-num" data-k="9">9</button>' +
          '<button class="k k-op"  data-k="/">/</button>' +
          '<button class="k k-fn"  data-k="sqrt">sqrt</button>' +
        '</div>' +
        '<div class="calc-row">' +
          '<button class="k k-mem" data-k="mr">MR</button>' +
          '<button class="k k-num" data-k="4">4</button>' +
          '<button class="k k-num" data-k="5">5</button>' +
          '<button class="k k-num" data-k="6">6</button>' +
          '<button class="k k-op"  data-k="*">*</button>' +
          '<button class="k k-fn"  data-k="pct">%</button>' +
        '</div>' +
        '<div class="calc-row">' +
          '<button class="k k-mem" data-k="ms">MS</button>' +
          '<button class="k k-num" data-k="1">1</button>' +
          '<button class="k k-num" data-k="2">2</button>' +
          '<button class="k k-num" data-k="3">3</button>' +
          '<button class="k k-op"  data-k="-">-</button>' +
          '<button class="k k-fn"  data-k="inv">1/x</button>' +
        '</div>' +
        '<div class="calc-row">' +
          '<button class="k k-mem" data-k="mp">M+</button>' +
          '<button class="k k-num" data-k="0">0</button>' +
          '<button class="k k-num" data-k="neg">+/-</button>' +
          '<button class="k k-num" data-k=".">.</button>' +
          '<button class="k k-op"  data-k="+">+</button>' +
          '<button class="k k-eq"  data-k="=">=</button>' +
        '</div>' +
      '</div>';

    const w = RW.WM.open({
      id: ID,
      title: 'Calculator',
      icon: ICONS.exe,
      width: 252,
      height: 280,
      resizable: false,
      contentNode: wrap
    });
    w.body.style.padding = '0';

    const dispEl = wrap.querySelector('#calc-disp');

    // State machine
    const state = {
      display: '0.',
      acc: 0,
      pending: null,    // pending operator: '+', '-', '*', '/'
      justEvaluated: false,
      replaceOnInput: true,
      memory: 0
    };

    function setDisplay(s) { state.display = s; dispEl.textContent = s; }

    function inputDigit(d) {
      if (state.replaceOnInput || state.display === '0.' || state.display === 'Error') {
        if (d === '.') setDisplay('0.');
        else setDisplay(d + '.');
        state.replaceOnInput = false;
        state.justEvaluated = false;
        return;
      }
      // Already typing
      let cur = state.display;
      if (d === '.') {
        // No-op if dot already present
        if (cur.indexOf('.') >= 0) {
          // Strip trailing dot of integer presentation? Actually the dot is always there.
          // We treat existing dot as decimal start.
          return;
        }
      }
      // Strip trailing dot when appending more digits if we're still integer mode
      const hasDotAlready = cur.lastIndexOf('.') >= 0;
      // Win95 display always has a trailing dot for integers (e.g., "12.")
      // If user types a digit and there is a trailing dot with nothing after, append before the dot
      const dotIdx = cur.indexOf('.');
      const afterDot = dotIdx >= 0 ? cur.length - dotIdx - 1 : 0;
      if (d === '.') {
        // If display is like "12." we keep it; if it has digits after the dot, ignore (only one dot)
        if (afterDot > 0) return;
        setDisplay(cur); // unchanged; user can now add decimals (we keep dot)
        // Mark that next digit goes after the dot
        state._afterDot = true;
        return;
      }
      if (state._afterDot || afterDot > 0) {
        setDisplay(cur + d);
        state._afterDot = false;
      } else {
        // Integer mode: insert before trailing dot
        if (dotIdx === cur.length - 1) {
          // Display is "123." -> "1234."
          setDisplay(cur.slice(0, -1) + d + '.');
        } else {
          setDisplay(cur + d);
        }
      }
    }

    function applyPending() {
      const cur = parseDisplay(state.display);
      if (state.pending == null) {
        state.acc = cur;
        return;
      }
      let result = state.acc;
      switch (state.pending) {
        case '+': result = state.acc + cur; break;
        case '-': result = state.acc - cur; break;
        case '*': result = state.acc * cur; break;
        case '/': result = (cur === 0) ? NaN : (state.acc / cur); break;
      }
      state.acc = result;
      setDisplay(formatNumber(result));
    }

    function inputOp(op) {
      if (state.pending && !state.replaceOnInput) {
        applyPending();
      } else {
        state.acc = parseDisplay(state.display);
      }
      state.pending = op;
      state.replaceOnInput = true;
      state.justEvaluated = false;
      state._afterDot = false;
    }

    function inputEquals() {
      if (state.pending == null) {
        state.acc = parseDisplay(state.display);
        return;
      }
      applyPending();
      state.pending = null;
      state.replaceOnInput = true;
      state.justEvaluated = true;
      state._afterDot = false;
    }

    function inputBackspace() {
      if (state.replaceOnInput || state.display === 'Error') return;
      let cur = state.display;
      const dotIdx = cur.indexOf('.');
      const afterDot = dotIdx >= 0 ? cur.length - dotIdx - 1 : 0;
      if (afterDot > 0) {
        // remove last digit after dot
        cur = cur.slice(0, -1);
        setDisplay(cur);
      } else {
        // remove last digit before dot (e.g., "123." -> "12.")
        if (dotIdx > 1) {
          cur = cur.slice(0, dotIdx - 1) + '.';
          setDisplay(cur);
        } else {
          setDisplay('0.');
          state.replaceOnInput = true;
        }
      }
    }

    function clearEntry() {
      setDisplay('0.');
      state.replaceOnInput = true;
      state._afterDot = false;
    }
    function clearAll() {
      setDisplay('0.');
      state.acc = 0;
      state.pending = null;
      state.replaceOnInput = true;
      state.justEvaluated = false;
      state._afterDot = false;
    }

    function negate() {
      if (state.display === '0.' || state.display === 'Error') return;
      if (state.display.charAt(0) === '-') setDisplay(state.display.slice(1));
      else setDisplay('-' + state.display);
    }

    function sqrt() {
      const v = parseDisplay(state.display);
      if (v < 0) { setDisplay('Error'); return; }
      setDisplay(formatNumber(Math.sqrt(v)));
      state.replaceOnInput = true;
    }
    function inv() {
      const v = parseDisplay(state.display);
      if (v === 0) { setDisplay('Error'); return; }
      setDisplay(formatNumber(1 / v));
      state.replaceOnInput = true;
    }
    function pct() {
      // Win95 calc % = acc * (current / 100), only applies when an op is pending
      if (state.pending == null) {
        setDisplay('0.');
        return;
      }
      const cur = parseDisplay(state.display);
      const result = state.acc * (cur / 100);
      setDisplay(formatNumber(result));
    }

    function handleKey(k) {
      if (RW.Audio) RW.Audio.click();
      switch (k) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          inputDigit(k); break;
        case '.': inputDigit('.'); break;
        case '+': case '-': case '*': case '/':
          inputOp(k); break;
        case '=': inputEquals(); break;
        case 'bk': inputBackspace(); break;
        case 'ce': clearEntry(); break;
        case 'c':  clearAll(); break;
        case 'neg': negate(); break;
        case 'sqrt': sqrt(); break;
        case 'inv': inv(); break;
        case 'pct': pct(); break;
        case 'mc': state.memory = 0; break;
        case 'mr': setDisplay(formatNumber(state.memory)); state.replaceOnInput = true; break;
        case 'ms': state.memory = parseDisplay(state.display); break;
        case 'mp': state.memory = state.memory + parseDisplay(state.display); break;
      }
    }

    // Wire buttons
    wrap.querySelectorAll('button.k').forEach(b => {
      b.addEventListener('click', () => handleKey(b.dataset.k));
    });

    // Keyboard input
    const onKey = (e) => {
      if (RW.WM.getActive() !== w) return;
      const k = e.key;
      if (k >= '0' && k <= '9') { handleKey(k); e.preventDefault(); return; }
      if (k === '.' || k === ',') { handleKey('.'); e.preventDefault(); return; }
      if (k === '+' || k === '-') { handleKey(k); e.preventDefault(); return; }
      if (k === '*' || k === 'x' || k === 'X') { handleKey('*'); e.preventDefault(); return; }
      if (k === '/') { handleKey('/'); e.preventDefault(); return; }
      if (k === '=' || k === 'Enter') { handleKey('='); e.preventDefault(); return; }
      if (k === 'Backspace') { handleKey('bk'); e.preventDefault(); return; }
      if (k === 'Escape') { handleKey('c'); e.preventDefault(); return; }
      if (k === 'Delete') { handleKey('ce'); e.preventDefault(); return; }
    };
    document.addEventListener('keydown', onKey);
    const prevClose = w.onClose;
    w.onClose = function () {
      document.removeEventListener('keydown', onKey);
      if (prevClose) prevClose();
    };

    // Menu wiring
    wireMenu(wrap, w, (act) => {
      if (act === 'copy') {
        try { navigator.clipboard.writeText(state.display.replace(/\.$/, '')); } catch (e) {}
      } else if (act === 'paste') {
        try {
          navigator.clipboard.readText().then(t => {
            const n = parseFloat(t);
            if (!isNaN(n)) { setDisplay(formatNumber(n)); state.replaceOnInput = true; }
          });
        } catch (e) {}
      } else if (act === 'standard') {
        // already standard
      } else if (act === 'about') {
        const html = '<div class="dialog-body">' +
          '<p><b>Calculator</b></p>' +
          '<p>Version 4.0 (Rick Wayne edition)</p>' +
          '<p>(c) 1995-2026 Rick Wayne.</p>' +
          '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
        const aw = RW.WM.open({ title: 'About Calculator', icon: ICONS.exe, width: 320, height: 180, resizable: false, contentHTML: html });
        aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
      }
    });
  };

  function wireMenu(wrap, w, handler) {
    wrap.querySelectorAll('.menu-bar .mb-item').forEach(mb => {
      mb.addEventListener('click', (e) => {
        wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => { if (x !== mb) x.classList.remove('open'); });
        mb.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => x.classList.remove('open'));
    });
    wrap.querySelectorAll('.menu-bar .mb-sub div').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => x.classList.remove('open'));
        const act = d.dataset.act;
        if (act) handler(act);
      });
    });
  }
})();
