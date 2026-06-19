// RICK WAYNE 93 - windows.js
// Tiny window manager. Open, close, drag, focus, resize, taskbar bookkeeping.

(function () {
  const WM = {
    layer: null,
    taskbar: null,
    windows: {},   // id -> { el, taskBtn, restoreRect }
    zTop: 100,
    openOffset: 0,

    init(layerEl, taskBtnContainer) {
      this.layer = layerEl;
      this.taskbar = taskBtnContainer;
    },

    // Open a new window. spec = { id, title, icon, body (HTMLElement|string), width, height, x, y }
    open(spec) {
      if (this.windows[spec.id]) {
        this.focus(spec.id);
        return this.windows[spec.id].el;
      }

      const win = document.createElement('section');
      win.className = 'window';
      win.dataset.id = spec.id;
      const z = ++this.zTop;
      win.style.zIndex = z;

      const w = spec.width  || 560;
      const h = spec.height || 420;
      // Cascade offsets
      const surface = this.layer.parentElement;
      const sr = surface.getBoundingClientRect();
      const cascade = (this.openOffset = (this.openOffset + 28) % 168);
      const x = (spec.x != null) ? spec.x : Math.max(20, Math.min(sr.width - w - 40, 60 + cascade));
      const y = (spec.y != null) ? spec.y : Math.max(20, Math.min(sr.height - h - 40, 40 + cascade));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
      win.style.width = w + 'px';
      win.style.height = h + 'px';

      // Title bar
      const tb = document.createElement('header');
      tb.className = 'window-titlebar';
      const tIcon = spec.icon ? `<span class="window-title-icon">${spec.icon}</span>` : '';
      tb.innerHTML = `
        <div class="window-title">${tIcon}<span>${escapeHTML(spec.title || 'Untitled')}</span></div>
        <div class="window-controls">
          <button class="win-btn" data-act="min"  title="Minimize">_</button>
          <button class="win-btn" data-act="max"  title="Maximize">&#9633;</button>
          <button class="win-btn" data-act="close" title="Close">X</button>
        </div>`;
      win.appendChild(tb);

      // Body
      const body = document.createElement('div');
      body.className = 'window-body';
      if (spec.body instanceof HTMLElement) body.appendChild(spec.body);
      else body.innerHTML = spec.body || '';
      win.appendChild(body);

      // Status bar
      if (spec.status !== false) {
        const sb = document.createElement('div');
        sb.className = 'window-statusbar';
        sb.textContent = spec.status || 'Ready.';
        win.appendChild(sb);
      }

      // Resize handle
      const rs = document.createElement('div');
      rs.className = 'window-resize';
      win.appendChild(rs);

      this.layer.appendChild(win);

      // Wire controls
      tb.querySelector('[data-act="close"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this.close(spec.id);
      });
      tb.querySelector('[data-act="min"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize(spec.id);
      });
      tb.querySelector('[data-act="max"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMax(spec.id);
      });
      tb.addEventListener('dblclick', () => this.toggleMax(spec.id));

      // Drag
      this._wireDrag(win, tb);
      // Resize
      this._wireResize(win, rs);
      // Focus on click
      win.addEventListener('mousedown', () => this.focus(spec.id), true);

      // Taskbar button
      const btn = document.createElement('button');
      btn.className = 'task-button active';
      btn.type = 'button';
      btn.innerHTML = `<span class="tb-dot"></span><span>${escapeHTML(spec.title || 'Untitled')}</span>`;
      btn.addEventListener('click', () => {
        if (win.hidden) { this.restore(spec.id); }
        else if (this._isTop(win)) { this.minimize(spec.id); }
        else { this.focus(spec.id); }
      });
      this.taskbar.appendChild(btn);

      this.windows[spec.id] = { el: win, taskBtn: btn };

      if (window.Sound) window.Sound.openWindow();
      this.focus(spec.id);
      return win;
    },

    close(id) {
      const w = this.windows[id];
      if (!w) return;
      w.el.remove();
      w.taskBtn.remove();
      delete this.windows[id];
      if (window.Sound) window.Sound.closeWindow();
    },

    focus(id) {
      const w = this.windows[id];
      if (!w) return;
      w.el.style.zIndex = ++this.zTop;
      w.el.hidden = false;
      Object.values(this.windows).forEach(x => {
        x.el.classList.toggle('inactive', x.el !== w.el);
        x.taskBtn.classList.toggle('active', x.el === w.el);
      });
    },

    minimize(id) {
      const w = this.windows[id];
      if (!w) return;
      w.el.hidden = true;
      w.taskBtn.classList.remove('active');
    },

    restore(id) {
      const w = this.windows[id];
      if (!w) return;
      w.el.hidden = false;
      this.focus(id);
    },

    toggleMax(id) {
      const w = this.windows[id];
      if (!w) return;
      const el = w.el;
      if (el.classList.contains('maximized')) {
        el.classList.remove('maximized');
        const r = w.restoreRect;
        if (r) {
          el.style.left = r.left + 'px';
          el.style.top = r.top + 'px';
          el.style.width = r.width + 'px';
          el.style.height = r.height + 'px';
        }
      } else {
        w.restoreRect = {
          left: parseInt(el.style.left, 10),
          top: parseInt(el.style.top, 10),
          width: el.offsetWidth,
          height: el.offsetHeight
        };
        const parent = this.layer.parentElement;
        const pr = parent.getBoundingClientRect();
        el.classList.add('maximized');
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = pr.width + 'px';
        el.style.height = pr.height + 'px';
      }
    },

    _isTop(el) {
      let topZ = -1, topEl = null;
      Object.values(this.windows).forEach(x => {
        const z = parseInt(x.el.style.zIndex || '0', 10);
        if (z > topZ && !x.el.hidden) { topZ = z; topEl = x.el; }
      });
      return topEl === el;
    },

    _wireDrag(win, handle) {
      let dragging = false, ox = 0, oy = 0;
      const onDown = (e) => {
        if (e.target.closest('.window-controls')) return;
        if (win.classList.contains('maximized')) return;
        dragging = true;
        const r = win.getBoundingClientRect();
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
        document.body.classList.add('dragging');
        e.preventDefault();
      };
      const onMove = (e) => {
        if (!dragging) return;
        const parent = this.layer.parentElement;
        const pr = parent.getBoundingClientRect();
        let nx = e.clientX - pr.left - ox;
        let ny = e.clientY - pr.top - oy;
        nx = Math.max(-win.offsetWidth + 80, Math.min(pr.width - 40, nx));
        ny = Math.max(0, Math.min(pr.height - 30, ny));
        win.style.left = nx + 'px';
        win.style.top = ny + 'px';
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        document.body.classList.remove('dragging');
      };
      handle.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },

    _wireResize(win, handle) {
      let resizing = false, startX = 0, startY = 0, startW = 0, startH = 0;
      const onDown = (e) => {
        if (win.classList.contains('maximized')) return;
        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = win.offsetWidth;
        startH = win.offsetHeight;
        document.body.classList.add('resizing');
        e.preventDefault();
        e.stopPropagation();
      };
      const onMove = (e) => {
        if (!resizing) return;
        const w = Math.max(280, startW + (e.clientX - startX));
        const h = Math.max(180, startH + (e.clientY - startY));
        win.style.width = w + 'px';
        win.style.height = h + 'px';
      };
      const onUp = () => {
        if (!resizing) return;
        resizing = false;
        document.body.classList.remove('resizing');
      };
      handle.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  };

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  window.WM = WM;
  window.escapeHTML = escapeHTML;
})();
