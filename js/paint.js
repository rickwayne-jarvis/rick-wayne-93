/* paint.js - Win95 MS Paint */

(function () {
  const RW = window.RW = window.RW || {};
  const Paint = RW.Paint = {};
  const ICONS = RW.ICONS;
  const ID = 'paint';

  // Authentic Win95 16/28-color palette
  const PALETTE = [
    '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
    '#808040','#004040','#0080ff','#004080','#4000ff','#804000',
    '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
    '#ffff80','#00ff80','#80ffff','#8080ff','#ff0080','#ff8040'
  ];

  // Tool ids
  const TOOLS = [
    { id: 'select-free', label: 'Free-Form Select', stub: true },
    { id: 'select',      label: 'Select',           stub: true },
    { id: 'eraser',      label: 'Eraser' },
    { id: 'fill',        label: 'Fill With Color' },
    { id: 'pick',        label: 'Pick Color' },
    { id: 'magnifier',   label: 'Magnifier',        stub: true },
    { id: 'pencil',      label: 'Pencil' },
    { id: 'brush',       label: 'Brush' },
    { id: 'airbrush',    label: 'Airbrush',         stub: true },
    { id: 'text',        label: 'Text',             stub: true },
    { id: 'line',        label: 'Line' },
    { id: 'curve',       label: 'Curve',            stub: true },
    { id: 'rect',        label: 'Rectangle' },
    { id: 'polygon',     label: 'Polygon',          stub: true },
    { id: 'ellipse',     label: 'Ellipse' },
    { id: 'rrect',       label: 'Rounded Rectangle', stub: true }
  ];

  function toolIconHTML(id) {
    // 16x16 SVG iconography for the toolbox
    const c = '#000', f = '#fff';
    const wrap = (inner) => '<svg viewBox="0 0 16 16" width="16" height="16">' + inner + '</svg>';
    switch (id) {
      case 'select-free': return wrap('<path d="M3 3c2-1 5-1 7 1 2 2 2 6 0 8-2 1-7 1-8-2" stroke="'+c+'" fill="none" stroke-dasharray="2 1"/>');
      case 'select':      return wrap('<rect x="3" y="3" width="10" height="10" stroke="'+c+'" fill="none" stroke-dasharray="2 1"/>');
      case 'eraser':      return wrap('<rect x="3" y="4" width="9" height="8" fill="#ffd9b0" stroke="'+c+'"/><rect x="3" y="9" width="9" height="3" fill="#fff" stroke="'+c+'"/>');
      case 'fill':        return wrap('<path d="M4 9 L9 4 L13 8 L8 13z" fill="#a0a0ff" stroke="'+c+'"/><path d="M12 11l1 2" stroke="'+c+'"/>');
      case 'pick':        return wrap('<path d="M3 13 L6 10 M10 6 L13 3 M10 4 L12 6 L8 10 L6 8z" stroke="'+c+'" fill="#ddd"/>');
      case 'magnifier':   return wrap('<circle cx="7" cy="7" r="4" stroke="'+c+'" fill="none"/><line x1="10" y1="10" x2="13" y2="13" stroke="'+c+'"/>');
      case 'pencil':      return wrap('<path d="M3 13l3-1 7-7-2-2-7 7z" fill="#ffe' + '0a0" stroke="'+c+'"/><path d="M11 5l2 2" stroke="'+c+'"/>');
      case 'brush':       return wrap('<path d="M3 13l4-2 5-7-3-2-5 8z" fill="#a07050" stroke="'+c+'"/><path d="M3 13l2-0" stroke="'+c+'"/>');
      case 'airbrush':    return wrap('<path d="M10 5l3-2 -1 4z" fill="'+c+'"/><circle cx="6" cy="8" r="2" fill="#888"/><circle cx="3" cy="11" r="0.6"/><circle cx="5" cy="13" r="0.6"/><circle cx="8" cy="13" r="0.6"/>');
      case 'text':        return wrap('<text x="3" y="13" font-family="serif" font-size="13" font-weight="bold" fill="'+c+'">A</text>');
      case 'line':        return wrap('<line x1="3" y1="13" x2="13" y2="3" stroke="'+c+'" stroke-width="2"/>');
      case 'curve':       return wrap('<path d="M3 12 Q8 0 13 12" stroke="'+c+'" fill="none" stroke-width="1.5"/>');
      case 'rect':        return wrap('<rect x="3" y="4" width="10" height="8" stroke="'+c+'" fill="none"/>');
      case 'polygon':     return wrap('<polygon points="3,12 6,4 11,4 13,9 8,12" stroke="'+c+'" fill="none"/>');
      case 'ellipse':     return wrap('<ellipse cx="8" cy="8" rx="5" ry="4" stroke="'+c+'" fill="none"/>');
      case 'rrect':       return wrap('<rect x="3" y="4" width="10" height="8" rx="3" ry="3" stroke="'+c+'" fill="none"/>');
    }
    return wrap('');
  }

  Paint.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    const wrap = document.createElement('div');
    wrap.className = 'paint-body';

    let toolsHTML = '';
    for (let i = 0; i < TOOLS.length; i += 2) {
      const a = TOOLS[i], b = TOOLS[i + 1];
      toolsHTML += '<div class="pt-row">';
      toolsHTML += '<button class="pt-tool" data-tool="' + a.id + '" title="' + a.label + '">' + toolIconHTML(a.id) + '</button>';
      if (b) toolsHTML += '<button class="pt-tool" data-tool="' + b.id + '" title="' + b.label + '">' + toolIconHTML(b.id) + '</button>';
      toolsHTML += '</div>';
    }

    let palHTML = '';
    PALETTE.forEach(col => {
      palHTML += '<button class="pt-color" style="background:' + col + '" data-color="' + col + '"></button>';
    });

    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item" data-menu="file"><u>F</u>ile' +
          '<div class="mb-sub">' +
            '<div data-act="new">New</div>' +
            '<div data-act="open">Open...</div>' +
            '<div data-act="save">Save</div>' +
            '<div data-act="print">Print...</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="edit"><u>E</u>dit' +
          '<div class="mb-sub">' +
            '<div data-act="undo">Undo</div>' +
            '<div data-act="redo">Redo</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="cut">Cut</div>' +
            '<div data-act="copy">Copy</div>' +
            '<div data-act="paste">Paste</div>' +
            '<div data-act="selall">Select All</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="view"><u>V</u>iew' +
          '<div class="mb-sub">' +
            '<div data-act="tools">Tool Box</div>' +
            '<div data-act="colorbox">Color Box</div>' +
            '<div data-act="status">Status Bar</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="image"><u>I</u>mage' +
          '<div class="mb-sub">' +
            '<div data-act="clear">Clear Image</div>' +
            '<div data-act="flip">Flip / Rotate...</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="colors"><u>C</u>olors' +
          '<div class="mb-sub">' +
            '<div data-act="editcol">Edit Colors...</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="about">About Paint</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="paint-workarea">' +
        '<div class="paint-toolbox">' +
          '<div class="pt-grid">' + toolsHTML + '</div>' +
          '<div class="pt-options" id="pt-options"></div>' +
        '</div>' +
        '<div class="paint-canvas-area">' +
          '<canvas id="paint-canvas" width="640" height="480"></canvas>' +
        '</div>' +
      '</div>' +
      '<div class="paint-palette">' +
        '<div class="pp-swatches">' +
          '<div class="pp-current">' +
            '<div class="pp-bg" id="pp-bg-swatch"></div>' +
            '<div class="pp-fg" id="pp-fg-swatch"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pp-palette" id="pp-palette">' + palHTML + '</div>' +
      '</div>' +
      '<div class="paint-statusbar">' +
        '<div class="ps-cell" id="ps-coords">For Help, click Help Topics on the Help Menu.</div>' +
        '<div class="ps-cell" id="ps-pos"></div>' +
        '<div class="ps-cell" id="ps-size">640 x 480</div>' +
      '</div>';

    const w = RW.WM.open({
      id: ID,
      title: 'untitled - Paint',
      icon: ICONS.exe,
      width: 720, height: 560,
      contentNode: wrap
    });
    w.body.style.padding = '0';

    const canvas = wrap.querySelector('#paint-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const state = {
      fg: '#000000',
      bg: '#ffffff',
      tool: 'pencil',
      brushSize: 1,       // pencil/brush/eraser size index
      shapeFill: 0,       // 0 outline, 1 filled
      dirty: false,
      drawing: false,
      startX: 0, startY: 0,
      snapshot: null,
      undoStack: [],
      redoStack: [],
      maxUndo: 16
    };

    function pushUndo() {
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        state.undoStack.push(data);
        if (state.undoStack.length > state.maxUndo) state.undoStack.shift();
        state.redoStack = [];
      } catch (e) {}
    }
    function doUndo() {
      if (!state.undoStack.length) return;
      try {
        const cur = ctx.getImageData(0, 0, canvas.width, canvas.height);
        state.redoStack.push(cur);
        const last = state.undoStack.pop();
        ctx.putImageData(last, 0, 0);
      } catch (e) {}
    }
    function doRedo() {
      if (!state.redoStack.length) return;
      try {
        const cur = ctx.getImageData(0, 0, canvas.width, canvas.height);
        state.undoStack.push(cur);
        const next = state.redoStack.pop();
        ctx.putImageData(next, 0, 0);
      } catch (e) {}
    }

    // Swatch refs
    const fgSw = wrap.querySelector('#pp-fg-swatch');
    const bgSw = wrap.querySelector('#pp-bg-swatch');
    function paintSwatches() {
      fgSw.style.background = state.fg;
      bgSw.style.background = state.bg;
    }
    paintSwatches();

    // Tool buttons
    function selectTool(id) {
      state.tool = id;
      wrap.querySelectorAll('.pt-tool').forEach(t => t.classList.toggle('active', t.dataset.tool === id));
      renderOptions();
    }
    wrap.querySelectorAll('.pt-tool').forEach(t => {
      t.addEventListener('click', () => selectTool(t.dataset.tool));
    });
    selectTool('pencil');

    // Options panel below toolbox
    function renderOptions() {
      const opts = wrap.querySelector('#pt-options');
      opts.innerHTML = '';
      const t = state.tool;
      if (t === 'pencil') {
        // single line size
        opts.appendChild(sizeRow([1]));
      } else if (t === 'brush') {
        opts.appendChild(sizeRow([2, 4, 8]));
      } else if (t === 'eraser') {
        opts.appendChild(sizeRow([4, 8, 12]));
      } else if (t === 'line') {
        opts.appendChild(sizeRow([1, 2, 4, 6]));
      } else if (t === 'rect' || t === 'ellipse') {
        opts.appendChild(fillRow());
      }
    }
    function sizeRow(sizes) {
      const row = document.createElement('div');
      row.className = 'pt-opt-list';
      sizes.forEach((sz, i) => {
        const b = document.createElement('button');
        b.className = 'pt-opt';
        b.dataset.size = sz;
        if ((state.brushSize|0) === sz || (i === 0 && !sizes.includes(state.brushSize))) {
          b.classList.add('active');
          state.brushSize = sz;
        }
        const dot = document.createElement('span');
        dot.className = 'pt-opt-dot';
        const visual = Math.min(20, Math.max(2, sz));
        dot.style.width = visual + 'px';
        dot.style.height = visual + 'px';
        dot.style.background = '#000';
        dot.style.borderRadius = '50%';
        b.appendChild(dot);
        b.addEventListener('click', () => {
          state.brushSize = sz;
          row.querySelectorAll('.pt-opt').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        });
        row.appendChild(b);
      });
      return row;
    }
    function fillRow() {
      const row = document.createElement('div');
      row.className = 'pt-opt-list pt-opt-fill';
      const options = [
        { key: 0, label: 'outline' },
        { key: 1, label: 'filled' }
      ];
      options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'pt-opt pt-opt-text';
        if (o.key === state.shapeFill) b.classList.add('active');
        b.textContent = o.label;
        b.addEventListener('click', () => {
          state.shapeFill = o.key;
          row.querySelectorAll('.pt-opt').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        });
        row.appendChild(b);
      });
      return row;
    }

    // Palette
    wrap.querySelectorAll('.pp-color').forEach(c => {
      c.addEventListener('click', (e) => {
        state.fg = c.dataset.color;
        paintSwatches();
      });
      c.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        state.bg = c.dataset.color;
        paintSwatches();
      });
    });

    // Canvas pointer events
    function getXY(e) {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.width / r.width;
      const sy = canvas.height / r.height;
      const x = Math.floor((e.clientX - r.left) * sx);
      const y = Math.floor((e.clientY - r.top) * sy);
      return [x, y];
    }
    function setStroke(color, size) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    function pencilLine(x0, y0, x1, y1, color) {
      // Bresenham 1px line for crisp pencil
      ctx.fillStyle = color;
      let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, e2;
      while (true) {
        ctx.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
    function brushDab(x, y, size, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    function eraserDab(x, y, size) {
      ctx.fillStyle = state.bg;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    function saveSnapshot() {
      state.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    function restoreSnapshot() {
      if (state.snapshot) ctx.putImageData(state.snapshot, 0, 0);
    }

    function floodFill(x, y, fillHex) {
      const w = canvas.width, h = canvas.height;
      const img = ctx.getImageData(0, 0, w, h);
      const data = img.data;
      function idx(xx, yy) { return (yy * w + xx) * 4; }
      const targetI = idx(x, y);
      const tr = data[targetI], tg = data[targetI + 1], tb = data[targetI + 2], ta = data[targetI + 3];
      const fr = parseInt(fillHex.slice(1, 3), 16);
      const fg = parseInt(fillHex.slice(3, 5), 16);
      const fb = parseInt(fillHex.slice(5, 7), 16);
      if (tr === fr && tg === fg && tb === fb && ta === 255) return;
      const stack = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
        const i = idx(cx, cy);
        if (data[i] !== tr || data[i + 1] !== tg || data[i + 2] !== tb || data[i + 3] !== ta) continue;
        data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;
        stack.push([cx + 1, cy]); stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]); stack.push([cx, cy - 1]);
      }
      ctx.putImageData(img, 0, 0);
    }

    function rgbAt(x, y) {
      const d = ctx.getImageData(x, y, 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    let lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
      const [x, y] = getXY(e);
      const isRight = e.button === 2;
      const useColor = isRight ? state.bg : state.fg;
      e.preventDefault();

      if (state.tool === 'pencil') {
        pushUndo();
        state.drawing = true;
        state.usingColor = useColor;
        lastX = x; lastY = y;
        pencilLine(x, y, x, y, useColor);
      } else if (state.tool === 'brush') {
        pushUndo();
        state.drawing = true;
        state.usingColor = useColor;
        lastX = x; lastY = y;
        brushDab(x, y, state.brushSize, useColor);
      } else if (state.tool === 'eraser') {
        pushUndo();
        state.drawing = true;
        lastX = x; lastY = y;
        eraserDab(x, y, state.brushSize);
      } else if (state.tool === 'line' || state.tool === 'rect' || state.tool === 'ellipse') {
        pushUndo();
        state.drawing = true;
        state.usingColor = useColor;
        state.startX = x; state.startY = y;
        saveSnapshot();
      } else if (state.tool === 'fill') {
        pushUndo();
        floodFill(x, y, useColor);
      } else if (state.tool === 'pick') {
        const hex = rgbAt(x, y);
        if (isRight) state.bg = hex; else state.fg = hex;
        paintSwatches();
      }
      state.dirty = true;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousemove', (e) => {
      const [x, y] = getXY(e);
      const ps = wrap.querySelector('#ps-pos');
      ps.textContent = x + ', ' + y;
      if (!state.drawing) return;
      if (state.tool === 'pencil') {
        pencilLine(lastX, lastY, x, y, state.usingColor);
        lastX = x; lastY = y;
      } else if (state.tool === 'brush') {
        // Draw a dab along the line for a smoother stroke
        const dx = x - lastX, dy = y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / Math.max(1, state.brushSize / 2)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          brushDab(lastX + dx * t, lastY + dy * t, state.brushSize, state.usingColor);
        }
        lastX = x; lastY = y;
      } else if (state.tool === 'eraser') {
        const dx = x - lastX, dy = y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / Math.max(1, state.brushSize / 2)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          eraserDab(lastX + dx * t, lastY + dy * t, state.brushSize);
        }
        lastX = x; lastY = y;
      } else if (state.tool === 'line') {
        restoreSnapshot();
        setStroke(state.usingColor, state.brushSize);
        ctx.beginPath();
        ctx.moveTo(state.startX, state.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (state.tool === 'rect') {
        restoreSnapshot();
        const rx = Math.min(state.startX, x), ry = Math.min(state.startY, y);
        const rw = Math.abs(x - state.startX), rh = Math.abs(y - state.startY);
        if (state.shapeFill) {
          ctx.fillStyle = state.usingColor;
          ctx.fillRect(rx, ry, rw, rh);
        } else {
          setStroke(state.usingColor, 1);
          ctx.strokeRect(rx + 0.5, ry + 0.5, rw, rh);
        }
      } else if (state.tool === 'ellipse') {
        restoreSnapshot();
        const cx = (state.startX + x) / 2, cy = (state.startY + y) / 2;
        const rx = Math.abs(x - state.startX) / 2, ry = Math.abs(y - state.startY) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (state.shapeFill) {
          ctx.fillStyle = state.usingColor;
          ctx.fill();
        } else {
          setStroke(state.usingColor, 1);
          ctx.stroke();
        }
      }
    });

    function endDraw() {
      if (state.drawing) {
        state.drawing = false;
        state.snapshot = null;
      }
    }
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);

    // Menu wiring
    wireMenu(wrap, w, (act) => {
      if (act === 'new')        actionNew();
      else if (act === 'open')  showStub('Open is not supported in this build.');
      else if (act === 'save')  actionSave();
      else if (act === 'print') showStub('Print is not supported in this build.');
      else if (act === 'exit')  RW.WM.close(ID);
      else if (act === 'undo')  doUndo();
      else if (act === 'redo')  doRedo();
      else if (act === 'cut')   showStub('Cut is not supported in this build.');
      else if (act === 'copy')  showStub('Copy is not supported in this build.');
      else if (act === 'paste') showStub('Paste is not supported in this build.');
      else if (act === 'selall')showStub('Select is not supported in this build.');
      else if (act === 'tools' || act === 'colorbox' || act === 'status') {/* visual toggles, not stored */}
      else if (act === 'clear') { pushUndo(); ctx.fillStyle = state.bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      else if (act === 'flip')  showStub('Flip / Rotate not supported.');
      else if (act === 'editcol')showStub('Custom color picker not supported.');
      else if (act === 'about') {
        const html = '<div class="dialog-body">' +
          '<p><b>Paint</b></p>' +
          '<p>Version 5.00 (Rick Wayne edition)</p>' +
          '<p>(c) 1995-2026 Rick Wayne.</p>' +
          '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
        const aw = RW.WM.open({ title: 'About Paint', icon: ICONS.exe, width: 320, height: 180, resizable: false, contentHTML: html });
        aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
      }
    });

    function showStub(msg) {
      const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(msg) + '</p></div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({ title: 'Paint', icon: ICONS.exe, width: 320, height: 160, resizable: false, contentHTML: html });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
    }

    function actionNew() {
      if (!state.dirty) {
        pushUndo(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        state.dirty = false; return;
      }
      const html = '<div class="dialog-body"><p>Save changes to Untitled?</p></div>' +
        '<div class="dialog-buttons">' +
          '<button data-act="yes">Yes</button>' +
          '<button data-act="no">No</button>' +
          '<button data-act="cancel">Cancel</button>' +
        '</div>';
      const dw = RW.WM.open({ title: 'Paint', icon: ICONS.exe, width: 340, height: 160, resizable: false, contentHTML: html });
      dw.body.querySelectorAll('button[data-act]').forEach(b => {
        b.addEventListener('click', () => {
          const a = b.dataset.act;
          RW.WM.close(dw.id);
          if (a === 'yes') { actionSave(); pushUndo(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); state.dirty = false; }
          else if (a === 'no') { pushUndo(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); state.dirty = false; }
        });
      });
    }

    function actionSave() {
      try {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'untitled.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        state.dirty = false;
      } catch (e) {}
    }

    // Wire palette buttons (re-bind since we ran querySelectorAll before children created)
    wrap.querySelectorAll('.pt-color').forEach(c => {});
    wrap.querySelectorAll('.pp-palette .pt-color, .pp-palette button').forEach(c => {});
    wrap.querySelectorAll('#pp-palette .pt-color, #pp-palette button').forEach(c => {
      c.addEventListener('click', () => { state.fg = c.dataset.color; paintSwatches(); });
      c.addEventListener('contextmenu', (e) => { e.preventDefault(); state.bg = c.dataset.color; paintSwatches(); });
    });

    // Push initial blank snapshot for undo coverage
    pushUndo();

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
