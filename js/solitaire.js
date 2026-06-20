/* solitaire.js - Klondike Solitaire (Draw One) */

(function () {
  const RW = window.RW = window.RW || {};
  const Sol = RW.Solitaire = {};
  const ICONS = RW.ICONS;
  const ID = 'solitaire';

  const SUITS = ['S','H','D','C']; // Spades, Hearts, Diamonds, Clubs
  const SUIT_GLYPH = { S: '♠', H: '♥', D: '♦', C: '♣' };
  const RANK_LABEL = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const RED = { H: 1, D: 1 };

  function makeDeck() {
    const deck = [];
    for (const s of SUITS) for (let r = 1; r <= 13; r++) deck.push({ suit: s, rank: r });
    return deck;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  Sol.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    const wrap = document.createElement('div');
    wrap.className = 'sol-body';
    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item" data-menu="game"><u>G</u>ame' +
          '<div class="mb-sub">' +
            '<div data-act="deal">Deal</div>' +
            '<div data-act="undo">Undo</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="deck">Deck...</div>' +
            '<div data-act="options">Options...</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="about">About Solitaire</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="sol-felt">' +
        '<div class="sol-top">' +
          '<div class="sol-pile sol-stock"   data-pile="stock"  data-idx="0"></div>' +
          '<div class="sol-pile sol-waste"   data-pile="waste"  data-idx="0"></div>' +
          '<div class="sol-spacer"></div>' +
          '<div class="sol-pile sol-found"   data-pile="found"  data-idx="0"></div>' +
          '<div class="sol-pile sol-found"   data-pile="found"  data-idx="1"></div>' +
          '<div class="sol-pile sol-found"   data-pile="found"  data-idx="2"></div>' +
          '<div class="sol-pile sol-found"   data-pile="found"  data-idx="3"></div>' +
        '</div>' +
        '<div class="sol-tableau">' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="0"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="1"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="2"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="3"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="4"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="5"></div>' +
          '<div class="sol-pile sol-tab" data-pile="tab" data-idx="6"></div>' +
        '</div>' +
        '<div class="sol-win" hidden><canvas id="sol-win-canvas"></canvas><div class="sol-win-tip">You win! Click to dismiss.</div></div>' +
      '</div>';

    const w = RW.WM.open({
      id: ID,
      title: 'Solitaire',
      icon: ICONS.exe,
      width: 600, height: 480,
      contentNode: wrap
    });
    w.body.style.padding = '0';

    const state = {
      stock: [],
      waste: [],
      found: [[], [], [], []],
      tab: [[], [], [], [], [], [], []], // each card {suit, rank, faceUp}
      history: [],
      deckBack: 'blue'
    };

    function snapshot() {
      return JSON.stringify({
        stock: state.stock, waste: state.waste, found: state.found, tab: state.tab
      });
    }
    function pushHistory() { state.history.push(snapshot()); if (state.history.length > 200) state.history.shift(); }
    function popHistory() {
      if (!state.history.length) return false;
      const snap = JSON.parse(state.history.pop());
      state.stock = snap.stock; state.waste = snap.waste; state.found = snap.found; state.tab = snap.tab;
      render(); return true;
    }

    function deal() {
      state.history = [];
      const deck = shuffle(makeDeck());
      state.stock = [];
      state.waste = [];
      state.found = [[], [], [], []];
      state.tab = [[], [], [], [], [], [], []];
      for (let col = 0; col < 7; col++) {
        for (let i = 0; i <= col; i++) {
          const card = deck.pop();
          card.faceUp = (i === col);
          state.tab[col].push(card);
        }
      }
      while (deck.length) state.stock.push(Object.assign(deck.pop(), { faceUp: false }));
      render();
    }

    function isRed(suit) { return !!RED[suit]; }

    function canStackOnTab(moving, target) {
      // moving is the first card of the dragged stack; target is the bottom-most exposed of the tableau column or null for empty.
      if (!target) return moving.rank === 13; // K to empty
      if (!target.faceUp) return false;
      if (isRed(moving.suit) === isRed(target.suit)) return false;
      return moving.rank === target.rank - 1;
    }

    function canStackOnFound(moving, foundIdx) {
      const pile = state.found[foundIdx];
      if (pile.length === 0) return moving.rank === 1;
      const top = pile[pile.length - 1];
      return top.suit === moving.suit && moving.rank === top.rank + 1;
    }

    function autoFlip() {
      for (let c = 0; c < 7; c++) {
        const col = state.tab[c];
        if (col.length && !col[col.length - 1].faceUp) col[col.length - 1].faceUp = true;
      }
    }

    function checkWin() {
      let total = 0;
      for (let f = 0; f < 4; f++) total += state.found[f].length;
      return total === 52;
    }

    // ===== Rendering =====
    const felt = wrap.querySelector('.sol-felt');
    const stockEl = wrap.querySelector('[data-pile=stock]');
    const wasteEl = wrap.querySelector('[data-pile=waste]');
    const foundEls = wrap.querySelectorAll('[data-pile=found]');
    const tabEls = wrap.querySelectorAll('[data-pile=tab]');

    function cardEl(card) {
      const el = document.createElement('div');
      el.className = 'sol-card';
      if (!card.faceUp) {
        el.classList.add('back', 'back-' + state.deckBack);
      } else {
        el.classList.add('face');
        if (isRed(card.suit)) el.classList.add('red');
        const rank = RANK_LABEL[card.rank - 1];
        const suit = SUIT_GLYPH[card.suit];
        el.innerHTML =
          '<div class="cnr tl"><div>' + rank + '</div><div>' + suit + '</div></div>' +
          '<div class="cnr br"><div>' + rank + '</div><div>' + suit + '</div></div>' +
          '<div class="pip">' + suit + '</div>';
      }
      el.dataset.suit = card.suit;
      el.dataset.rank = card.rank;
      return el;
    }

    function render() {
      stockEl.innerHTML = '';
      if (state.stock.length) {
        const fake = { suit: 'S', rank: 1, faceUp: false };
        const el = cardEl(fake);
        stockEl.appendChild(el);
      } else {
        stockEl.innerHTML = '<div class="sol-empty">&#x21BA;</div>';
      }

      wasteEl.innerHTML = '';
      if (state.waste.length) {
        const top = state.waste[state.waste.length - 1];
        const el = cardEl(top);
        el.dataset.from = 'waste';
        attachDrag(el, { from: 'waste', idx: state.waste.length - 1 });
        attachDouble(el, () => tryAutoSendToFoundation('waste', state.waste.length - 1));
        wasteEl.appendChild(el);
      }

      foundEls.forEach((pileEl, i) => {
        pileEl.innerHTML = '';
        const pile = state.found[i];
        if (pile.length) {
          const top = pile[pile.length - 1];
          const el = cardEl(top);
          el.dataset.from = 'found';
          el.dataset.foundIdx = i;
          attachDrag(el, { from: 'found', idx: i });
          pileEl.appendChild(el);
        } else {
          pileEl.innerHTML = '<div class="sol-empty">&#x2666;</div>';
        }
      });

      tabEls.forEach((pileEl, i) => {
        pileEl.innerHTML = '';
        const col = state.tab[i];
        col.forEach((card, j) => {
          const el = cardEl(card);
          el.style.top = (j * 18) + 'px';
          el.dataset.from = 'tab';
          el.dataset.tabIdx = i;
          el.dataset.tabPos = j;
          if (card.faceUp) {
            attachDrag(el, { from: 'tab', col: i, pos: j });
            attachDouble(el, () => {
              // Only top card can auto-send
              if (j === col.length - 1) tryAutoSendToFoundation('tab', i, j);
            });
          }
          pileEl.appendChild(el);
        });
        if (!col.length) {
          pileEl.innerHTML = '<div class="sol-empty"></div>';
        }
      });

      // Wire stock click
      stockEl.onclick = () => {
        pushHistory();
        if (state.stock.length) {
          const c = state.stock.pop();
          c.faceUp = true;
          state.waste.push(c);
        } else {
          // Reset waste -> stock
          while (state.waste.length) {
            const c = state.waste.pop();
            c.faceUp = false;
            state.stock.push(c);
          }
        }
        render();
        if (RW.Audio) RW.Audio.click();
      };
    }

    function tryAutoSendToFoundation(from, a, b) {
      pushHistory();
      let card, removeFn;
      if (from === 'waste') {
        if (!state.waste.length) return;
        card = state.waste[state.waste.length - 1];
        removeFn = () => state.waste.pop();
      } else if (from === 'tab') {
        const col = state.tab[a];
        if (b !== col.length - 1) return;
        card = col[b];
        removeFn = () => col.pop();
      }
      for (let f = 0; f < 4; f++) {
        if (canStackOnFound(card, f)) {
          removeFn();
          state.found[f].push(card);
          autoFlip();
          render();
          if (checkWin()) startWinAnimation();
          if (RW.Audio) RW.Audio.ding();
          return;
        }
      }
      // No legal foundation, roll back
      state.history.pop();
    }

    // ===== Drag and drop =====
    let dragState = null;

    function attachDouble(el, fn) {
      let last = 0;
      el.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - last < 300) fn();
        last = now;
      });
    }

    function gatherCards(info) {
      const cards = [];
      if (info.from === 'tab') {
        const col = state.tab[info.col];
        for (let k = info.pos; k < col.length; k++) cards.push(col[k]);
      } else if (info.from === 'waste') {
        cards.push(state.waste[state.waste.length - 1]);
      } else if (info.from === 'found') {
        cards.push(state.found[info.idx][state.found[info.idx].length - 1]);
      }
      return cards;
    }

    function attachDrag(el, info) {
      el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const cards = gatherCards(info);
        if (!cards.length) return;
        e.preventDefault();
        beginDrag(info, cards, e.clientX, e.clientY, 'mouse');
      });
      // v9: touch drag. Single touch begins drag, touchmove follows, touchend
      // drops on whichever pile is under the finger. Prevents default on
      // touchmove so the felt doesn't scroll mid-drag.
      el.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const cards = gatherCards(info);
        if (!cards.length) return;
        const t = e.touches[0];
        beginDrag(info, cards, t.clientX, t.clientY, 'touch');
        e.preventDefault();
      }, { passive: false });
    }

    function beginDrag(info, cards, x, y, src) {
      const ghost = document.createElement('div');
      ghost.className = 'sol-drag-ghost';
      cards.forEach((c, idx) => {
        const el = cardEl(c);
        el.style.top = (idx * 18) + 'px';
        ghost.appendChild(el);
      });
      ghost.style.left = x + 'px';
      ghost.style.top  = y + 'px';
      document.body.appendChild(ghost);
      dragState = { info, cards, ghost, startX: x, startY: y, src: src };
      if (src === 'mouse') {
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
      } else {
        document.addEventListener('touchmove', onTouchDragMove, { passive: false });
        document.addEventListener('touchend', onTouchDragEnd);
        document.addEventListener('touchcancel', onTouchDragEnd);
      }
    }
    function onDragMove(e) {
      if (!dragState) return;
      dragState.ghost.style.left = (e.clientX - 24) + 'px';
      dragState.ghost.style.top  = (e.clientY - 12) + 'px';
    }
    function onTouchDragMove(e) {
      if (!dragState || !e.touches || !e.touches.length) return;
      const t = e.touches[0];
      dragState.ghost.style.left = (t.clientX - 24) + 'px';
      dragState.ghost.style.top  = (t.clientY - 12) + 'px';
      e.preventDefault();
    }
    function onTouchDragEnd(e) {
      if (!dragState) return;
      const t = (e.changedTouches && e.changedTouches[0]) || null;
      const x = t ? t.clientX : dragState.startX;
      const y = t ? t.clientY : dragState.startY;
      document.removeEventListener('touchmove', onTouchDragMove);
      document.removeEventListener('touchend', onTouchDragEnd);
      document.removeEventListener('touchcancel', onTouchDragEnd);
      finishDrag(x, y);
    }
    function onDragEnd(e) {
      if (!dragState) return;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      finishDrag(e.clientX, e.clientY);
    }
    function finishDrag(x, y) {
      const { info, cards, ghost } = dragState;
      ghost.remove();
      dragState = null;

      // Determine drop target
      const targetPile = topElementUnder(x, y);
      if (!targetPile) { return; }
      const pileKind = targetPile.dataset.pile;
      const pileIdx = parseInt(targetPile.dataset.idx, 10);

      // Single-card to foundation
      if (pileKind === 'found' && cards.length === 1 && canStackOnFound(cards[0], pileIdx)) {
        pushHistory();
        removeSource(info);
        state.found[pileIdx].push(cards[0]);
        autoFlip();
        render();
        if (checkWin()) startWinAnimation();
        if (RW.Audio) RW.Audio.ding();
        return;
      }
      // Drop on tab column
      if (pileKind === 'tab') {
        const col = state.tab[pileIdx];
        const target = col.length ? col[col.length - 1] : null;
        if (canStackOnTab(cards[0], target)) {
          pushHistory();
          removeSource(info);
          cards.forEach(c => col.push(c));
          autoFlip();
          render();
          if (RW.Audio) RW.Audio.click();
          return;
        }
      }
      // Illegal, snap back (just re-render)
      render();
    }

    function removeSource(info) {
      if (info.from === 'waste') state.waste.pop();
      else if (info.from === 'found') state.found[info.idx].pop();
      else if (info.from === 'tab') {
        const col = state.tab[info.col];
        col.splice(info.pos, col.length - info.pos);
      }
    }

    function topElementUnder(x, y) {
      // Find a sol-pile beneath the pointer
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        const p = el.closest && el.closest('.sol-pile');
        if (p && wrap.contains(p)) return p;
      }
      return null;
    }

    // ===== Win animation =====
    function startWinAnimation() {
      if (RW.Easter && RW.Easter.markSolitaireWin) RW.Easter.markSolitaireWin();
      const winLayer = wrap.querySelector('.sol-win');
      const canvas = wrap.querySelector('#sol-win-canvas');
      const rect = felt.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      winLayer.hidden = false;
      const ctx = canvas.getContext('2d');
      const cards = [];
      // Launch 52 little card rectangles from the foundations
      for (let i = 0; i < 52; i++) {
        cards.push({
          x: Math.random() * canvas.width,
          y: 60 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 6,
          vy: 1 + Math.random() * 2,
          color: ['#ff6060','#60a0ff','#ffd060','#80d080','#c080ff','#ff80a0'][i % 6]
        });
      }
      let running = true;
      function step() {
        if (!running) return;
        ctx.fillStyle = 'rgba(0,80,0,0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        cards.forEach(c => {
          c.x += c.vx; c.y += c.vy; c.vy += 0.2;
          if (c.y > canvas.height - 28) { c.y = canvas.height - 28; c.vy = -Math.abs(c.vy) * 0.85; c.vx += (Math.random() - 0.5) * 1.4; }
          if (c.x < -28) c.x = canvas.width + 28;
          if (c.x > canvas.width + 28) c.x = -28;
          ctx.fillStyle = c.color;
          ctx.fillRect(c.x, c.y, 22, 28);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(c.x + 0.5, c.y + 0.5, 22, 28);
        });
        requestAnimationFrame(step);
      }
      step();
      winLayer.onclick = () => { running = false; winLayer.hidden = true; };
    }

    // ===== Menu wiring =====
    wireMenu(wrap, w, (act) => {
      if (act === 'deal') deal();
      else if (act === 'undo') popHistory();
      else if (act === 'deck') openDeckPicker();
      else if (act === 'options') stub('Options not supported in this build.');
      else if (act === 'exit') RW.WM.close(ID);
      else if (act === 'about') {
        const html = '<div class="dialog-body">' +
          '<p><b>Solitaire</b></p>' +
          '<p>Klondike (Draw One)</p>' +
          '<p>(c) 1995-2026 Rick Wayne.</p>' +
          '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
        const aw = RW.WM.open({ title: 'About Solitaire', icon: ICONS.exe, width: 320, height: 180, resizable: false, contentHTML: html });
        aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
      }
    });

    function openDeckPicker() {
      const html = '<div class="dialog-body sol-deck-picker">' +
        '<p>Pick a deck back:</p>' +
        '<div class="sol-deck-grid">' +
          '<button class="sol-deck-btn back back-blue"  data-deck="blue"></button>' +
          '<button class="sol-deck-btn back back-red"   data-deck="red"></button>' +
          '<button class="sol-deck-btn back back-castle" data-deck="castle"></button>' +
        '</div></div>' +
        '<div class="dialog-buttons"><button data-close>Close</button></div>';
      const dw = RW.WM.open({ title: 'Select Card Back', icon: ICONS.exe, width: 320, height: 220, resizable: false, contentHTML: html });
      dw.body.querySelectorAll('.sol-deck-btn').forEach(b => {
        b.addEventListener('click', () => {
          state.deckBack = b.dataset.deck;
          render();
          // v8: indecision easter egg. Track the last few deck choices;
          // if the user has picked 3 different decks in a row, Rick lobs
          // a one-liner. Fires once per session so it doesn't get noisy.
          trackDeckPick(b.dataset.deck);
        });
      });
      dw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(dw.id));
    }

    // v8 easter egg state - lives on the Solitaire window scope so it
    // resets when the user closes and reopens the game in a new session.
    const deckPickHistory = [];
    let indecisionFired = false;
    function trackDeckPick(deck) {
      // Only register a NEW pick if it differs from the most recent one.
      // Picking the same deck twice in a row doesn't count as indecision.
      const last = deckPickHistory[deckPickHistory.length - 1];
      if (deck === last) return;
      deckPickHistory.push(deck);
      // Keep history bounded so we don't grow forever.
      while (deckPickHistory.length > 3) deckPickHistory.shift();
      if (indecisionFired) return;
      // Three different consecutive picks fires the egg.
      if (deckPickHistory.length >= 3) {
        const a = deckPickHistory[0], b = deckPickHistory[1], c = deckPickHistory[2];
        if (a !== b && b !== c && a !== c) {
          indecisionFired = true;
          showIndecisionDialog();
        }
      }
    }
    function showIndecisionDialog() {
      const html =
        '<div class="dialog-body">' +
          '<p><b>Indecisive. Same. - Rick</b></p>' +
        '</div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const dw = RW.WM.open({
        title: 'Solitaire', icon: ICONS.exe,
        width: 320, height: 160, resizable: false, contentHTML: html
      });
      dw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(dw.id));
    }
    function stub(msg) {
      const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(msg) + '</p></div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({ title: 'Solitaire', icon: ICONS.exe, width: 320, height: 160, resizable: false, contentHTML: html });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
    }

    deal();
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
