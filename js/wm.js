/* wm.js - Window Manager
   Open/close/drag/resize/min/max/focus/z-order/taskbar buttons.

   v7: touch awareness. When window.RW_TOUCH is true (set in index.html based
   on (pointer: coarse) plus viewport width), new windows open fullscreen
   under the taskbar, drag and resize are disabled, and only one window is
   visible at a time (others are minimized into the taskbar). The Win95
   chrome (title bar, bevels, controls) is unchanged - it's the same OS,
   just sized for thumbs. */

(function () {
  const RW = window.RW = window.RW || {};

  const layer = () => document.getElementById('window-layer');
  const taskbar = () => document.getElementById('task-buttons');
  const isTouch = () => !!window.RW_TOUCH;

  let zCounter = 100;
  let idCounter = 0;
  const windows = {};
  let activeId = null;

  const WM = RW.WM = {};

  function taskbarHeight() {
    const tb = document.getElementById('taskbar');
    return tb ? tb.offsetHeight : 28;
  }

  function fitFullscreen(el) {
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.width = window.innerWidth + 'px';
    el.style.height = (window.innerHeight - taskbarHeight()) + 'px';
  }

  function makeId() { return 'win_' + (++idCounter); }

  function bringToFront(id) {
    const w = windows[id];
    if (!w) return;
    zCounter++;
    if (zCounter > 8999) zCounter = 8999;
    w.el.style.zIndex = zCounter;
    // mark all inactive
    Object.values(windows).forEach(x => {
      x.el.classList.add('inactive');
      const tb = x.task; if (tb) tb.classList.remove('active');
      // v7 touch: hide every other window. Only the active one is visible;
      // the rest live on the taskbar and come back when tapped. Marks them
      // minimized in our internal state so toggleMinimize works correctly.
      if (isTouch() && x !== w) {
        x.el.style.display = 'none';
        x.minimized = true;
        if (x.task) x.task.classList.add('minimized');
      }
    });
    if (isTouch()) {
      w.el.style.display = '';
      w.minimized = false;
      fitFullscreen(w.el);
    }
    w.el.classList.remove('inactive');
    if (w.task) {
      w.task.classList.add('active');
      w.task.classList.remove('minimized');
    }
    activeId = id;
  }

  function close(id) {
    const w = windows[id];
    if (!w) return;
    if (w.onClose) {
      try { w.onClose(); } catch (e) {}
    }
    w.el.remove();
    if (w.task) w.task.remove();
    delete windows[id];
    if (activeId === id) activeId = null;
    if (RW.Audio) RW.Audio.click();
    document.dispatchEvent(new CustomEvent('rw:window-closed', { detail: { id: id } }));
    // v7 touch: when the active window closes, surface the next one if any
    // exist - otherwise the user is staring at the empty desktop wondering
    // where their other apps went.
    if (isTouch()) {
      const remaining = Object.keys(windows);
      if (remaining.length) bringToFront(remaining[remaining.length - 1]);
    }
  }

  function toggleMinimize(id) {
    const w = windows[id];
    if (!w) return;
    if (w.minimized) {
      w.el.style.display = '';
      w.minimized = false;
      if (w.task) w.task.classList.remove('minimized');
      bringToFront(id);
    } else {
      w.el.style.display = 'none';
      w.minimized = true;
      if (w.task) {
        w.task.classList.remove('active');
        w.task.classList.add('minimized');
      }
      activeId = null;
    }
  }

  function toggleMaximize(id) {
    const w = windows[id];
    if (!w) return;
    if (w.maximized) {
      Object.assign(w.el.style, w.preMax);
      w.maximized = false;
    } else {
      w.preMax = {
        left: w.el.style.left,
        top: w.el.style.top,
        width: w.el.style.width,
        height: w.el.style.height
      };
      const layerRect = layer().getBoundingClientRect();
      const tb = document.getElementById('taskbar');
      const tbh = tb ? tb.offsetHeight : 28;
      w.el.style.left = '0px';
      w.el.style.top = '0px';
      w.el.style.width = window.innerWidth + 'px';
      w.el.style.height = (window.innerHeight - tbh) + 'px';
      w.maximized = true;
    }
  }

  function open(opts) {
    opts = opts || {};
    const id = opts.id || makeId();

    // If id provided and already exists, focus
    if (opts.id && windows[opts.id]) {
      if (windows[opts.id].minimized) toggleMinimize(opts.id);
      bringToFront(opts.id);
      return windows[opts.id];
    }

    const w = {
      id: id,
      title: opts.title || 'Window',
      icon: opts.icon || '',
      onClose: opts.onClose,
      minimized: false,
      maximized: false,
      resizable: opts.resizable !== false,
      minWidth: opts.minWidth || 240,
      minHeight: opts.minHeight || 140
    };

    // Build window DOM
    const el = document.createElement('div');
    el.className = 'window rw-window';
    el.dataset.winId = id;

    const tb = document.createElement('div');
    tb.className = 'title-bar';
    const tbText = document.createElement('div');
    tbText.className = 'title-bar-text';
    tbText.innerHTML = (opts.icon ? '<span class="tb-icon">' + opts.icon + '</span> ' : '') + escapeHtml(w.title);
    tb.appendChild(tbText);

    const ctrls = document.createElement('div');
    ctrls.className = 'title-bar-controls';
    const btnMin = document.createElement('button');
    btnMin.setAttribute('aria-label', 'Minimize');
    btnMin.addEventListener('click', (e) => { e.stopPropagation(); toggleMinimize(id); });
    const btnMax = document.createElement('button');
    btnMax.setAttribute('aria-label', 'Maximize');
    btnMax.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(id); });
    const btnClose = document.createElement('button');
    btnClose.setAttribute('aria-label', 'Close');
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(id); });
    ctrls.appendChild(btnMin); ctrls.appendChild(btnMax); ctrls.appendChild(btnClose);
    tb.appendChild(ctrls);
    el.appendChild(tb);

    const body = document.createElement('div');
    body.className = 'window-body rw-window-body';
    if (opts.contentClass) body.classList.add(opts.contentClass);
    if (opts.contentHTML) body.innerHTML = opts.contentHTML;
    if (opts.contentNode) body.appendChild(opts.contentNode);
    el.appendChild(body);

    // Position
    const lr = layer().getBoundingClientRect();
    const width = opts.width || 520;
    const height = opts.height || 360;
    let left = opts.x;
    let top = opts.y;
    if (left == null) {
      const offset = (Object.keys(windows).length % 8) * 24;
      left = Math.max(20, Math.floor((window.innerWidth - width) / 2)) + offset;
    }
    if (top == null) {
      const offset = (Object.keys(windows).length % 8) * 24;
      top = Math.max(20, Math.floor((window.innerHeight - height) / 2 - 40)) + offset;
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.width = width + 'px';
    el.style.height = height + 'px';

    // v7 touch: every window opens fullscreen. Drag/resize are pointless on
    // a phone, so they get skipped entirely below.
    if (isTouch()) {
      fitFullscreen(el);
      w.maximized = true;
    }

    // Resize handle (corner) - mouse only
    if (w.resizable && !isTouch()) {
      const rh = document.createElement('div');
      rh.className = 'rw-resize-handle';
      el.appendChild(rh);
      addResize(el, rh, w);
    }

    layer().appendChild(el);

    // Drag - mouse only
    if (!isTouch()) addDrag(el, tb, w);

    // Focus on mousedown
    el.addEventListener('mousedown', () => bringToFront(id), true);

    // Double-click titlebar = max
    tb.addEventListener('dblclick', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      toggleMaximize(id);
    });

    w.el = el;
    w.body = body;
    windows[id] = w;

    // Taskbar button
    const btn = document.createElement('button');
    btn.className = 'task-btn';
    btn.type = 'button';
    btn.innerHTML = (opts.icon ? '<span class="tb-icon">' + opts.icon + '</span> ' : '') + escapeHtml(w.title);
    btn.addEventListener('click', () => {
      if (w.minimized) {
        toggleMinimize(id);
      } else if (activeId === id) {
        toggleMinimize(id);
      } else {
        bringToFront(id);
      }
    });
    taskbar().appendChild(btn);
    w.task = btn;

    bringToFront(id);

    if (RW.Audio) RW.Audio.click();
    return w;
  }

  function addDrag(el, handle, w) {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      if (w.maximized) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      document.body.style.cursor = 'move';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      el.style.left = Math.max(-el.offsetWidth + 80, ox + (e.clientX - sx)) + 'px';
      el.style.top = Math.max(0, oy + (e.clientY - sy)) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; document.body.style.cursor = ''; }
    });
  }

  function addResize(el, handle, w) {
    let resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('mousedown', (e) => {
      if (w.maximized) return;
      resizing = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
      e.preventDefault();
      e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      el.style.width = Math.max(w.minWidth, sw + (e.clientX - sx)) + 'px';
      el.style.height = Math.max(w.minHeight, sh + (e.clientY - sy)) + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (resizing) resizing = false;
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function cycleAltTab() {
    const ids = Object.keys(windows).filter(id => !windows[id].minimized);
    if (ids.length < 2) return;
    let idx = ids.indexOf(activeId);
    idx = (idx + 1) % ids.length;
    bringToFront(ids[idx]);
  }

  function closeActive() {
    if (activeId) close(activeId);
  }

  function getActive() { return activeId ? windows[activeId] : null; }
  function get(id) { return windows[id]; }
  function all() { return Object.values(windows); }

  // v7 touch: keep fullscreen windows fitted across orientation changes.
  window.addEventListener('resize', () => {
    if (!isTouch()) return;
    Object.values(windows).forEach(x => {
      if (!x.minimized) fitFullscreen(x.el);
    });
  });

  Object.assign(WM, {
    open, close, bringToFront, toggleMinimize, toggleMaximize,
    cycleAltTab, closeActive, getActive, get, all, escapeHtml
  });
})();
