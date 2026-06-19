/* wallpaper.js - generates authentic Win95 wallpapers via canvas,
   exposes RW.Wallpaper.apply(name) and the catalog. */

(function () {
  const RW = window.RW = window.RW || {};
  const Wallpaper = RW.Wallpaper = {};

  // Pseudo-random with seed so wallpapers regenerate identically
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  }

  function paintClouds(ctx, w, h) {
    // Authentic Clouds.bmp: vertical gradient (deeper blue top to lighter mid),
    // with diffuse white wisps. We approximate the gradient and overlay blobs.
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3a7fbf');
    grad.addColorStop(0.55, '#5a9ed8');
    grad.addColorStop(1, '#7fb6e2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const r = rng(95);
    // Lay down 90 soft white blobs of varying radii
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 90; i++) {
      const cx = r() * w;
      const cy = r() * h;
      const radius = 60 + r() * 220;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const alpha = 0.10 + r() * 0.18;
      g.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // A few brighter wisps near the top
    for (let i = 0; i < 24; i++) {
      const cx = r() * w;
      const cy = r() * h * 0.55;
      const radius = 30 + r() * 90;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, 'rgba(255,255,255,0.45)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function paintTriangles(ctx, w, h) {
    // Win95 Triangles: dark teal field with scattered colored triangles
    ctx.fillStyle = '#005a5a';
    ctx.fillRect(0, 0, w, h);
    const r = rng(123);
    const palette = ['#ff8080', '#80ff80', '#8080ff', '#ffff80', '#ff80ff', '#80ffff'];
    for (let i = 0; i < 140; i++) {
      const cx = r() * w;
      const cy = r() * h;
      const size = 12 + r() * 36;
      const rot = r() * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = palette[Math.floor(r() * palette.length)];
      ctx.globalAlpha = 0.55;
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
    // Carved Stone: warm gray with soft noise + carved bevel grid blocks
    ctx.fillStyle = '#9c8e7c';
    ctx.fillRect(0, 0, w, h);
    const r = rng(404);
    // Noise speckle
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (r() - 0.5) * 28;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
    // Bevel blocks
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

  function generate(name) {
    const canvas = document.createElement('canvas');
    const w = 1600;
    const h = 1000;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (name === 'Clouds')      paintClouds(ctx, w, h);
    else if (name === 'Triangles')   paintTriangles(ctx, w, h);
    else if (name === 'Carved Stone') paintCarvedStone(ctx, w, h);
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
    { name: 'Clouds',       kind: 'image' },
    { name: 'Teal',         kind: 'color', value: '#008080' },
    { name: 'Triangles',    kind: 'image' },
    { name: 'Carved Stone', kind: 'image' },
    { name: 'Navy',         kind: 'color', value: '#000080' },
    { name: 'Magenta',      kind: 'color', value: '#800080' }
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
    Wallpaper.apply(saved || 'Clouds');
  }

  document.addEventListener('rw:desktop-ready', init);
})();
