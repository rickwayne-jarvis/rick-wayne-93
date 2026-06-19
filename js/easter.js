/* easter.js - BSOD, Konami, hidden trigger interactions */

(function () {
  const RW = window.RW = window.RW || {};
  const E = RW.Easter = {};

  E.bsod = function () {
    const el = document.getElementById('bsod');
    el.hidden = false;
    if (RW.Audio) RW.Audio.error();
    function dismiss() {
      el.hidden = true;
      document.removeEventListener('keydown', dismiss);
      el.removeEventListener('click', dismiss);
    }
    document.addEventListener('keydown', dismiss);
    el.addEventListener('click', dismiss);
  };

  E.rename = function () {
    const html = '<div class="dialog-body"><p>Rename to what, exactly?</p><p style="font-size:11px;color:#666">This icon is load-bearing.</p></div><div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Rename', icon: RW.ICONS.text,
      width: 320, height: 180, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  };

  // ===== Toast helper =====
  let toastTimer = null;
  E.toast = function (msg, ms) {
    let t = document.getElementById('rw-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'rw-toast';
      t.className = 'rw-toast';
      document.body.appendChild(t);
    }
    t.innerHTML =
      '<div class="rw-toast-title">Surprise</div>' +
      '<div class="rw-toast-body">' + RW.WM.escapeHtml(msg) + '</div>';
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('show'); }, ms || 6000);
  };

  // ===== Konami: shake + toast =====
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    const expected = sequence[pos];
    if (k.toLowerCase() === expected.toLowerCase()) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        triggerKonami();
      }
    } else {
      pos = (k === sequence[0]) ? 1 : 0;
    }
  });

  function triggerKonami() {
    document.body.classList.add('crt-shake');
    if (RW.Audio) {
      RW.Audio.ding();
      setTimeout(() => RW.Audio.ding(), 200);
    }
    setTimeout(() => {
      document.body.classList.remove('crt-shake');
    }, 1200);
    E.toast('You found a thing. Tell Rick. rick_wayne@me.com');
  }

  // ===== Letter buffer for typed keywords =====
  function isTextInput(target) {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
    if (target.isContentEditable) return true;
    return false;
  }

  const BUFFER_MAX = 10;
  let typedBuf = '';
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTextInput(e.target)) return;
    const k = e.key;
    if (k.length === 1 && /[a-zA-Z0-9]/.test(k)) {
      typedBuf = (typedBuf + k.toLowerCase()).slice(-BUFFER_MAX);
      if (typedBuf.endsWith('hire')) {
        openHireDialog();
        typedBuf = '';
      } else if (typedBuf.endsWith('1989')) {
        openBornDialog();
        typedBuf = '';
      }
    }
  });

  function openHireDialog() {
    const html =
      '<div class="dialog-body">' +
        '<p><b>RE: hire</b></p>' +
        '<p>Easy. rick_wayne@me.com</p>' +
      '</div>' +
      '<div class="dialog-buttons">' +
        '<button data-act="email">Open Email</button>' +
        '<button data-act="close">Close</button>' +
      '</div>';
    const w = RW.WM.open({
      title: 'RE: hire', icon: RW.ICONS.mail,
      width: 360, height: 180, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-act="email"]').addEventListener('click', () => {
      window.location.href = 'mailto:rick_wayne@me.com?subject=Let%27s%20talk';
    });
    w.body.querySelector('[data-act="close"]').addEventListener('click', () => RW.WM.close(w.id));
  }

  function openBornDialog() {
    const html =
      '<div class="dialog-body born-1989">' +
        '<p class="bsod-style-bar">RICK_WAYNE.SYS</p>' +
        '<p>Born this year. Thanks for noticing.</p>' +
        '<p>Press any key to continue _</p>' +
      '</div>' +
      '<div class="dialog-buttons">' +
        '<button data-act="myspace">Open My Space (back when I was cool)</button>' +
        '<button data-close>OK</button>' +
      '</div>';
    const w = RW.WM.open({
      title: 'RICK_WAYNE.SYS', icon: RW.ICONS.computer,
      width: 460, height: 220, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-act="myspace"]').addEventListener('click', () => {
      RW.WM.close(w.id);
      if (RW.MySpace && RW.MySpace.open) RW.MySpace.open();
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }

  // ===== Tray clock 5x dblclick within 3s =====
  document.addEventListener('rw:desktop-ready', () => {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    let clicks = [];
    clockEl.addEventListener('dblclick', () => {
      const now = Date.now();
      clicks = clicks.filter(t => now - t < 3000);
      clicks.push(now);
      if (clicks.length >= 5) {
        clicks = [];
        const html =
          '<div class="dialog-body">' +
            '<p><b>About this clock</b></p>' +
            '<p>Rick is 90 seconds late to everything except call time. Call time is sacred.</p>' +
          '</div>' +
          '<div class="dialog-buttons"><button data-close>OK</button></div>';
        const w = RW.WM.open({
          title: 'About this clock', icon: RW.ICONS.computer,
          width: 380, height: 180, resizable: false, contentHTML: html
        });
        w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
      }
    });
  });

  // ===== Minesweeper first win =====
  E.markMinesweeperWin = function () {
    try {
      if (sessionStorage.getItem('rw93_ms_won') === '1') return;
      sessionStorage.setItem('rw93_ms_won', '1');
    } catch (e) {}
    setTimeout(() => {
      const html =
        '<div class="dialog-body">' +
          '<p><b>Minesweeper</b></p>' +
          '<p>You play like Rick on a deadline. Tell him: rick_wayne@me.com</p>' +
        '</div>' +
        '<div class="dialog-buttons">' +
          '<button data-act="email">Email Rick</button>' +
          '<button data-close>OK</button>' +
        '</div>';
      const w = RW.WM.open({
        title: 'You win', icon: RW.ICONS.mine,
        width: 380, height: 200, resizable: false, contentHTML: html
      });
      w.body.querySelector('[data-act="email"]').addEventListener('click', () => {
        window.location.href = 'mailto:rick_wayne@me.com?subject=Minesweeper%20fastest%20mine%20sweeper';
      });
      w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
    }, 700);
  };

  // ===== Solitaire first win =====
  E.markSolitaireWin = function () {
    try {
      if (sessionStorage.getItem('rw93_sol_won') === '1') return;
      sessionStorage.setItem('rw93_sol_won', '1');
    } catch (e) {}
    setTimeout(() => {
      let overlay = document.getElementById('sol-rick-card');
      if (overlay) overlay.remove();
      overlay = document.createElement('div');
      overlay.id = 'sol-rick-card';
      overlay.className = 'sol-rick-card';
      overlay.innerHTML =
        '<div class="src-card">' +
          '<div class="src-corner tl"><div>R</div><div>&#9824;</div></div>' +
          '<div class="src-corner br"><div>R</div><div>&#9824;</div></div>' +
          '<div class="src-name">RICK WAYNE</div>' +
          '<div class="src-role">DIRECTOR</div>' +
        '</div>';
      document.body.appendChild(overlay);
      // v5: clicking the bouncing card ALSO opens My Space.url.
      overlay.addEventListener('click', () => {
        overlay.remove();
        if (RW.MySpace && RW.MySpace.open) RW.MySpace.open();
      });
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 12000);
    }, 600);
  };
})();
