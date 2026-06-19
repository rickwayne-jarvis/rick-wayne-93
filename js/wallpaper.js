/* wallpaper.js - 7 authentic Win95 wallpapers, Teal default */

(function () {
  const RW = window.RW = window.RW || {};
  const Wallpaper = RW.Wallpaper = {};

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  }

  function paintClouds(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3B81C4');
    grad.addColorStop(1, '#87CEEB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const r = rng(95);
    ctx.globalCompositeOperation = 'lighter';
    // Soft cloud shapes: clusters of overlapping radial blobs
    for (let i = 0; i < 80; i++) {
      const cx = r() * w;
      const cy = r() * h;
      const radius = 80 + r() * 220;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const alpha = 0.12 + r() * 0.18;
      g.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 22; i++) {
      const cx = r() * w;
      const cy = r() * h * 0.6;
      const radius = 30 + r() * 90;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function paintTriangles(ctx, w, h) {
    // Win95 Plus! Triangles: dark teal field, small muted triangles
    ctx.fillStyle = '#0a4b4b';
    ctx.fillRect(0, 0, w, h);
    const r = rng(123);
    const palette = ['#d4a4a4', '#a4d4a4', '#a4a4d4', '#d4d4a4', '#d4a4d4', '#a4d4d4', '#888888'];
    for (let i = 0; i < 280; i++) {
      const cx = r() * w;
      const cy = r() * h;
      const size = 6 + r() * 14;
      const rot = r() * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = palette[Math.floor(r() * palette.length)];
      ctx.globalAlpha = 0.6 + r() * 0.3;
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function paintCarvedStone(ctx, w, h) {
    ctx.fillStyle = '#9c8e7c';
    ctx.fillRect(0, 0, w, h);
    const r = rng(404);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (r() - 0.5) * 28;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
    const block = 96;
    for (let y = 0; y < h; y += block) {
      for (let x = 0; x < w; x += block) {
        ctx.strokeStyle = 'rgba(255,240,210,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + block);
        ctx.lineTo(x, y);
        ctx.lineTo(x + block, y);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(40,30,20,0.22)';
        ctx.beginPath();
        ctx.moveTo(x + block, y);
        ctx.lineTo(x + block, y + block);
        ctx.lineTo(x, y + block);
        ctx.stroke();
      }
    }
  }

  function paintForest(ctx, w, h) {
    // Forest: green base with random speckles
    ctx.fillStyle = '#2d5e3a';
    ctx.fillRect(0, 0, w, h);
    const r = rng(771);
    const palette = ['#1d3e25', '#3a7a4a', '#4a8a5a', '#7a8a3a', '#5a4a2a', '#8b7b2b', '#234020', '#a8a440'];
    for (let i = 0; i < 6000; i++) {
      const x = Math.floor(r() * w);
      const y = Math.floor(r() * h);
      const sz = 1 + Math.floor(r() * 3);
      ctx.fillStyle = palette[Math.floor(r() * palette.length)];
      ctx.fillRect(x, y, sz, sz);
    }
    // Dappled brighter highlights
    for (let i = 0; i < 80; i++) {
      const cx = r() * w;
      const cy = r() * h;
      const rad = 18 + r() * 36;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(180,210,120,0.10)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function paintSetup(ctx, w, h) {
    // Setup: blue/grey 8px checker
    const colA = '#5384A8';
    const colB = '#7AAACC';
    const cell = 8;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        ctx.fillStyle = (((x / cell) + (y / cell)) % 2 === 0) ? colA : colB;
        ctx.fillRect(x, y, cell, cell);
      }
    }
  }

  function paintBrick(ctx, w, h) {
    // Brick: rows offset, mortar lines grey
    ctx.fillStyle = '#7a7670';
    ctx.fillRect(0, 0, w, h);
    const brickW = 64;
    const brickH = 28;
    const mortar = 4;
    for (let row = 0, y = 0; y < h; row++, y += brickH + mortar) {
      const offset = (row % 2 === 0) ? 0 : -((brickW + mortar) / 2);
      for (let x = offset; x < w; x += brickW + mortar) {
        const r = ((x * 73 + y * 31 + row * 17) & 0xff) / 255;
        const variant = '#' +
          Math.floor(0x8b - 16 + r * 32).toString(16).padStart(2, '0') +
          Math.floor(0x3a - 8  + r * 16).toString(16).padStart(2, '0') +
          Math.floor(0x2a - 8  + r * 12).toString(16).padStart(2, '0');
        ctx.fillStyle = variant;
        ctx.fillRect(x, y, brickW, brickH);
        // Bevel highlight
        ctx.strokeStyle = 'rgba(255,200,160,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + brickH);
        ctx.lineTo(x, y);
        ctx.lineTo(x + brickW, y);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath();
        ctx.moveTo(x + brickW, y);
        ctx.lineTo(x + brickW, y + brickH);
        ctx.lineTo(x, y + brickH);
        ctx.stroke();
      }
    }
  }

  function generate(name) {
    const canvas = document.createElement('canvas');
    const w = 1600;
    const h = 1000;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (name === 'Clouds')           paintClouds(ctx, w, h);
    else if (name === 'Triangles')   paintTriangles(ctx, w, h);
    else if (name === 'Carved Stone')paintCarvedStone(ctx, w, h);
    else if (name === 'Forest')      paintForest(ctx, w, h);
    else if (name === 'Setup')       paintSetup(ctx, w, h);
    else if (name === 'Brick')       paintBrick(ctx, w, h);
    else return null;
    return canvas.toDataURL('image/png');
  }

  const cache = {};
  function dataURL(name) {
    if (cache[name]) return cache[name];
    const url = generate(name);
    if (url) cache[name] = url;
    return url;
  }

  Wallpaper.catalog = [
    { name: 'Teal',         kind: 'color', value: '#008080' },
    { name: 'Clouds',       kind: 'image' },
    { name: 'Triangles',    kind: 'image' },
    { name: 'Carved Stone', kind: 'image' },
    { name: 'Forest',       kind: 'image' },
    { name: 'Setup',        kind: 'image' },
    { name: 'Brick',        kind: 'image' }
  ];

  Wallpaper.apply = function (name) {
    const item = Wallpaper.catalog.find(c => c.name === name);
    if (!item) return;
    const deskEl = document.querySelector('.desktop');
    if (item.kind === 'color') {
      if (deskEl) {
        deskEl.style.background = item.value;
        deskEl.style.backgroundSize = '';
      }
      document.body.style.background = item.value;
    } else {
      const url = dataURL(item.name);
      if (!url) return;
      const css = 'center / cover no-repeat ' + 'url("' + url + '")';
      if (deskEl) deskEl.style.background = css;
      document.body.style.background = '#000';
    }
    Wallpaper.current = name;
    try { sessionStorage.setItem('rw93_wallpaper', name); } catch (e) {}
  };

  Wallpaper.previewURL = function (name) {
    const item = Wallpaper.catalog.find(c => c.name === name);
    if (!item) return null;
    if (item.kind === 'color') return null;
    return dataURL(name);
  };

  Wallpaper.previewColor = function (name) {
    const item = Wallpaper.catalog.find(c => c.name === name);
    return item && item.kind === 'color' ? item.value : null;
  };

  function init() {
    let saved = null;
    try { saved = sessionStorage.getItem('rw93_wallpaper'); } catch (e) {}
    Wallpaper.apply(saved || 'Teal');
  }

  document.addEventListener('rw:desktop-ready', init);
})();
