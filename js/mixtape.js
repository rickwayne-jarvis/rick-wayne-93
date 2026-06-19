/* mixtape.js - Win95 Sound Recorder / Media Player styled Mixtape player.
   Procedural lo-fi tracks via Web Audio. AnalyserNode driven visualizer
   with three styles (Bars / Oscilloscope / Pulse) cycled by clicking the
   canvas. Swap titles, artists, or src URLs by editing MIXTAPE below. */

(function () {
  const RW = window.RW = window.RW || {};
  const Mix = RW.Mixtape = {};
  const ID = 'mixtape';

  // === Track config. Swap title / artist / src in one place. ===
  // src: string -> use HTMLAudioElement. null -> procedural synth via synthPreset.
  const MIXTAPE = [
    { title: 'Untitled Track 1', artist: 'TBD',           src: null, duration: 36, synthPreset: 'preset1' },
    { title: 'Untitled Track 2', artist: 'TBD',           src: null, duration: 34, synthPreset: 'preset2' },
    { title: 'Untitled Track 3', artist: 'TBD',           src: null, duration: 38, synthPreset: 'preset3' },
    { title: 'Untitled Track 4', artist: 'TBD',           src: null, duration: 32, synthPreset: 'preset4' },
    { title: 'Untitled Track 5', artist: 'TBD',           src: null, duration: 40, synthPreset: 'preset5' },
    { title: 'Untitled Track 6', artist: 'TBD',           src: null, duration: 36, synthPreset: 'preset6' },
    { title: 'Untitled Track 7', artist: 'TBD',           src: null, duration: 33, synthPreset: 'preset7' },
    { title: 'Untitled Track 8', artist: 'TBD',           src: null, duration: 42, synthPreset: 'preset8' }
  ];
  Mix.MIXTAPE = MIXTAPE;

  // === Synth presets. Each preset has tempo (bpm), key (Hz of root),
  // scale (semitone offsets), bass waveform, lead waveform, and a melody pattern. ===
  const PRESETS = {
    preset1: { tempo: 92,  rootHz: 130.81, scale: [0,3,5,7,10],  bassType: 'sine',     leadType: 'square',   lead: [0,3,5,7,3,5,7,10] },
    preset2: { tempo: 76,  rootHz: 146.83, scale: [0,2,4,7,9],   bassType: 'triangle', leadType: 'triangle', lead: [0,2,4,7,4,2,4,7] },
    preset3: { tempo: 104, rootHz: 110.00, scale: [0,3,5,7,8,10],bassType: 'sawtooth', leadType: 'square',   lead: [0,5,3,7,5,8,7,10] },
    preset4: { tempo: 84,  rootHz: 164.81, scale: [0,2,3,5,7,10],bassType: 'sine',     leadType: 'sine',     lead: [0,2,3,5,7,5,3,2] },
    preset5: { tempo: 96,  rootHz: 123.47, scale: [0,2,4,5,7,9], bassType: 'triangle', leadType: 'square',   lead: [0,4,5,7,9,7,5,4] },
    preset6: { tempo: 70,  rootHz: 196.00, scale: [0,3,5,7,10],  bassType: 'sine',     leadType: 'triangle', lead: [0,3,5,3,5,7,5,3] },
    preset7: { tempo: 110, rootHz: 146.83, scale: [0,2,4,7,9],   bassType: 'sawtooth', leadType: 'square',   lead: [0,2,4,7,9,7,4,2] },
    preset8: { tempo: 88,  rootHz: 130.81, scale: [0,3,5,7,8,10],bassType: 'triangle', leadType: 'triangle', lead: [0,3,5,7,10,8,7,5] }
  };

  const STYLES = ['bars', 'oscilloscope', 'pulse'];
  const SCALES = [1, 2, 4];

  // Shared mixtape audio engine. Reused by the MySpace auto-play widget.
  const Engine = Mix._engine = {
    ctx: null,
    master: null,
    analyser: null,
    timeData: null,
    freqData: null,
    activeIndex: -1,
    activeNodes: [],
    htmlAudio: null,
    sourceNode: null,
    startTime: 0,
    pauseOffset: 0,
    isPlaying: false,
    duration: 0,
    onTickListeners: new Set(),
    onTrackEndListeners: new Set(),
    onTrackChangeListeners: new Set(),
    volume: 0.6
  };

  function ensureCtx() {
    if (Engine.ctx) return Engine.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    Engine.ctx = new Ctx();
    Engine.master = Engine.ctx.createGain();
    Engine.master.gain.value = Engine.volume;
    Engine.analyser = Engine.ctx.createAnalyser();
    Engine.analyser.fftSize = 1024;
    Engine.analyser.smoothingTimeConstant = 0.78;
    Engine.timeData = new Uint8Array(Engine.analyser.fftSize);
    Engine.freqData = new Uint8Array(Engine.analyser.frequencyBinCount);
    Engine.master.connect(Engine.analyser);
    Engine.analyser.connect(Engine.ctx.destination);
    return Engine.ctx;
  }

  function stopActiveNodes() {
    Engine.activeNodes.forEach(n => {
      try { if (n.stop) n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    Engine.activeNodes = [];
    if (Engine.htmlAudio) {
      try { Engine.htmlAudio.pause(); } catch (e) {}
      try {
        if (Engine.sourceNode) Engine.sourceNode.disconnect();
      } catch (e) {}
      Engine.sourceNode = null;
    }
  }

  function midiToHz(rootHz, semitones) {
    return rootHz * Math.pow(2, semitones / 12);
  }

  function schedulePreset(presetKey, durationSec) {
    const p = PRESETS[presetKey] || PRESETS.preset1;
    const ctx = Engine.ctx;
    const now = ctx.currentTime;
    const beatSec = 60 / p.tempo;
    const eighth = beatSec / 2;
    const sixteenth = beatSec / 4;

    // Filter chain to keep things lo-fi
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    lp.Q.value = 0.7;
    lp.connect(Engine.master);
    Engine.activeNodes.push(lp);

    // Drum bus
    const drumBus = ctx.createGain();
    drumBus.gain.value = 0.6;
    drumBus.connect(Engine.master);
    Engine.activeNodes.push(drumBus);

    // === Drums (kick on 1 and 3, snare on 2 and 4, hat on every 8th) ===
    for (let t = 0; t < durationSec; t += beatSec) {
      const beatIdx = Math.round(t / beatSec) % 4;
      if (beatIdx === 0 || beatIdx === 2) scheduleKick(drumBus, now + t);
      if (beatIdx === 1 || beatIdx === 3) scheduleSnare(drumBus, now + t);
    }
    for (let t = 0; t < durationSec; t += eighth) {
      scheduleHat(drumBus, now + t, ((t / eighth) | 0) % 2 === 0 ? 0.05 : 0.04);
    }

    // === Bass (root note on each downbeat, an octave drop on beat 4) ===
    let bassPos = 0;
    for (let t = 0; t < durationSec; t += beatSec) {
      const beatIdx = Math.round(t / beatSec) % 8;
      const semis = p.scale[(beatIdx % p.scale.length)] - 12;
      const freq = midiToHz(p.rootHz, semis);
      scheduleBass(lp, now + t, freq, beatSec * 0.9, p.bassType);
      bassPos++;
    }

    // === Lead melody (loop the lead pattern in 8th notes) ===
    const lead = p.lead;
    let i = 0;
    for (let t = 0; t < durationSec; t += eighth) {
      const note = lead[i % lead.length];
      const freq = midiToHz(p.rootHz, note + 12); // octave up
      scheduleLead(lp, now + t, freq, eighth * 0.85, p.leadType);
      i++;
    }

    // === Chord pad every 2 beats ===
    for (let t = 0; t < durationSec; t += beatSec * 2) {
      schedulePad(lp, now + t, p.rootHz, p.scale, beatSec * 1.9);
    }

    // Master fade at end
    Engine.master.gain.setValueAtTime(Engine.volume, now + durationSec - 0.4);
    Engine.master.gain.linearRampToValueAtTime(0.0001, now + durationSec);
    // restore after end (next track)
    Engine.master.gain.setValueAtTime(Engine.volume, now + durationSec + 0.05);
  }

  function scheduleKick(out, at) {
    const ctx = Engine.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.18);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.9, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    osc.connect(g); g.connect(out);
    osc.start(at); osc.stop(at + 0.25);
    Engine.activeNodes.push(osc);
  }
  function scheduleSnare(out, at) {
    const ctx = Engine.ctx;
    const len = Math.floor(ctx.sampleRate * 0.18);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1400;
    const g = ctx.createGain(); g.gain.value = 0.45;
    src.connect(hp); hp.connect(g); g.connect(out);
    src.start(at); src.stop(at + 0.2);
    Engine.activeNodes.push(src);
  }
  function scheduleHat(out, at, vol) {
    const ctx = Engine.ctx;
    const len = Math.floor(ctx.sampleRate * 0.06);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 6000;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(hp); hp.connect(g); g.connect(out);
    src.start(at); src.stop(at + 0.08);
    Engine.activeNodes.push(src);
  }
  function scheduleBass(out, at, freq, dur, type) {
    const ctx = Engine.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.32, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g); g.connect(out);
    osc.start(at); osc.stop(at + dur + 0.02);
    Engine.activeNodes.push(osc);
  }
  function scheduleLead(out, at, freq, dur, type) {
    const ctx = Engine.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.13, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g); g.connect(out);
    osc.start(at); osc.stop(at + dur + 0.02);
    Engine.activeNodes.push(osc);
  }
  function schedulePad(out, at, rootHz, scale, dur) {
    const ctx = Engine.ctx;
    const notes = [scale[0], scale[2] != null ? scale[2] : 4, scale[4] != null ? scale[4] : 7];
    notes.forEach((semi, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = midiToHz(rootHz, semi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.06, at + 0.4);
      g.gain.linearRampToValueAtTime(0.0001, at + dur);
      osc.connect(g); g.connect(out);
      osc.start(at); osc.stop(at + dur + 0.05);
      Engine.activeNodes.push(osc);
    });
  }

  Engine.playIndex = function (idx, opts) {
    opts = opts || {};
    ensureCtx();
    if (!Engine.ctx) return;
    if (Engine.ctx.state === 'suspended') Engine.ctx.resume();
    if (idx < 0 || idx >= MIXTAPE.length) return;

    stopActiveNodes();

    Engine.activeIndex = idx;
    const track = MIXTAPE[idx];
    Engine.duration = track.duration;
    Engine.pauseOffset = 0;

    if (track.src) {
      const a = new Audio(track.src);
      a.crossOrigin = 'anonymous';
      a.loop = false;
      a.volume = 1.0;
      Engine.htmlAudio = a;
      const src = Engine.ctx.createMediaElementSource(a);
      src.connect(Engine.master);
      Engine.sourceNode = src;
      a.addEventListener('ended', () => {
        Engine.notifyEnded();
      }, { once: true });
      a.play().catch(() => {});
      Engine.duration = isFinite(a.duration) && a.duration > 0 ? a.duration : track.duration;
    } else {
      schedulePreset(track.synthPreset, Engine.duration);
      // schedule a "ended" tick
      setTimeout(() => {
        if (Engine.activeIndex === idx && Engine.isPlaying) {
          Engine.notifyEnded();
        }
      }, Engine.duration * 1000);
    }

    Engine.startTime = Engine.ctx.currentTime;
    Engine.isPlaying = true;
    Engine.notifyTrackChange(idx);
  };

  Engine.pause = function () {
    if (!Engine.isPlaying) return;
    Engine.pauseOffset = Engine.currentTime();
    if (Engine.htmlAudio) {
      try { Engine.htmlAudio.pause(); } catch (e) {}
    } else {
      stopActiveNodes();
    }
    Engine.isPlaying = false;
  };

  Engine.resume = function () {
    if (Engine.isPlaying) return;
    if (Engine.activeIndex < 0) {
      Engine.playIndex(0);
      return;
    }
    if (Engine.htmlAudio) {
      Engine.htmlAudio.play().catch(() => {});
      Engine.isPlaying = true;
      return;
    }
    // For synth, restart current track from beginning (simpler than offset).
    Engine.playIndex(Engine.activeIndex);
  };

  Engine.stop = function () {
    stopActiveNodes();
    Engine.isPlaying = false;
    Engine.pauseOffset = 0;
    Engine.startTime = 0;
  };

  Engine.next = function () {
    const next = (Engine.activeIndex + 1) % MIXTAPE.length;
    Engine.playIndex(next);
  };
  Engine.prev = function () {
    const prev = (Engine.activeIndex - 1 + MIXTAPE.length) % MIXTAPE.length;
    Engine.playIndex(prev);
  };

  Engine.currentTime = function () {
    if (!Engine.ctx) return 0;
    if (Engine.htmlAudio) return Engine.htmlAudio.currentTime;
    if (!Engine.isPlaying) return Engine.pauseOffset;
    return Engine.ctx.currentTime - Engine.startTime;
  };

  Engine.setVolume = function (v) {
    Engine.volume = Math.max(0, Math.min(1, v));
    if (Engine.master) Engine.master.gain.value = Engine.volume;
  };

  Engine.notifyEnded = function () {
    Engine.isPlaying = false;
    Engine.onTrackEndListeners.forEach(fn => { try { fn(Engine.activeIndex); } catch (e) {} });
  };
  Engine.notifyTrackChange = function (idx) {
    Engine.onTrackChangeListeners.forEach(fn => { try { fn(idx); } catch (e) {} });
  };

  Engine.onTick = function (fn) { Engine.onTickListeners.add(fn); return () => Engine.onTickListeners.delete(fn); };
  Engine.onTrackEnd = function (fn) { Engine.onTrackEndListeners.add(fn); return () => Engine.onTrackEndListeners.delete(fn); };
  Engine.onTrackChange = function (fn) { Engine.onTrackChangeListeners.add(fn); return () => Engine.onTrackChangeListeners.delete(fn); };

  // Master tick loop (one per page)
  function startTickLoop() {
    function tick() {
      Engine.onTickListeners.forEach(fn => { try { fn(); } catch (e) {} });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  startTickLoop();

  // === MixTape window UI ===
  Mix.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }
    const ICONS = RW.ICONS;
    const cassetteIcon = mixtapeIcon();

    const wrap = document.createElement('div');
    wrap.className = 'mix-body';
    wrap.innerHTML = mixtapeHTML();

    const w = RW.WM.open({
      id: ID,
      title: "Mixtape - Rick's 90s/2000s",
      icon: cassetteIcon,
      width: 540, height: 480,
      contentNode: wrap,
      onClose: () => {
        // Stop everything when Mixtape window closes (unless MySpace is using it)
        if (!RW.MySpace || !RW.MySpace.isOpen()) {
          Engine.stop();
        }
        if (uiUnsub) uiUnsub.forEach(fn => fn());
      }
    });
    w.body.style.padding = '0';

    const uiUnsub = [];
    const canvas = wrap.querySelector('#mix-vis');
    const cctx = canvas.getContext('2d');
    const baseW = canvas.width = 280;
    const baseH = canvas.height = 140;
    let visStyleIdx = 0;
    let visScaleIdx = 0;

    const marquee = wrap.querySelector('#mix-marquee-text');
    const trackListEl = wrap.querySelector('#mix-tracklist');
    const playBtn = wrap.querySelector('#mix-play');
    const pauseBtn = wrap.querySelector('#mix-pause');
    const stopBtn = wrap.querySelector('#mix-stop');
    const prevBtn = wrap.querySelector('#mix-prev');
    const nextBtn = wrap.querySelector('#mix-next');
    const volSlider = wrap.querySelector('#mix-vol');
    const timeReadout = wrap.querySelector('#mix-time');

    renderTrackList();
    renderMarquee(Engine.activeIndex < 0 ? 0 : Engine.activeIndex);

    // Track list rows
    function renderTrackList() {
      trackListEl.innerHTML = '';
      MIXTAPE.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'mix-row';
        if (i === Engine.activeIndex) row.classList.add('active');
        row.innerHTML =
          '<span class="mr-num">' + (i + 1) + '</span>' +
          '<span class="mr-title">' + escapeHtml(t.title) + '</span>' +
          '<span class="mr-artist">' + escapeHtml(t.artist) + '</span>' +
          '<span class="mr-time">' + fmtTime(t.duration) + '</span>';
        row.addEventListener('click', () => {
          Engine.playIndex(i);
        });
        trackListEl.appendChild(row);
      });
    }

    function renderMarquee(i) {
      const t = MIXTAPE[i] || MIXTAPE[0];
      // music note glyph is the allowed exception
      marquee.textContent = '♪ ' + t.title + ' - ' + t.artist + ' ♪   ';
    }

    function fmtTime(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    // Wire transport
    playBtn.addEventListener('click', () => {
      if (Engine.activeIndex < 0) Engine.playIndex(0);
      else if (!Engine.isPlaying) Engine.resume();
    });
    pauseBtn.addEventListener('click', () => { Engine.pause(); });
    stopBtn.addEventListener('click', () => { Engine.stop(); renderMarquee(Engine.activeIndex < 0 ? 0 : Engine.activeIndex); });
    prevBtn.addEventListener('click', () => { Engine.prev(); });
    nextBtn.addEventListener('click', () => { Engine.next(); });
    volSlider.addEventListener('input', () => { Engine.setVolume(parseInt(volSlider.value, 10) / 100); });
    volSlider.value = Math.round(Engine.volume * 100);

    // Visualizer cycle on click
    canvas.addEventListener('click', () => {
      visStyleIdx = (visStyleIdx + 1) % STYLES.length;
      updateEffectsMenu();
    });

    // === Menu bar ===
    wireMenu(wrap, (act) => {
      if (act === 'file-new')   gagDialog('New mixtape? Burn another CD. Get a Sharpie.');
      else if (act === 'file-open') gagDialog('No tapes found.\n\nThe Compaq ate them.');
      else if (act === 'file-save') gagDialog('Cannot save. This mixtape is read-only by design.');
      else if (act === 'file-exit') RW.WM.close(ID);
      else if (act === 'edit-cut') beepDialog();
      else if (act === 'edit-copy') beepDialog();
      else if (act === 'edit-paste') beepDialog();
      else if (act === 'effects-bars') { visStyleIdx = 0; updateEffectsMenu(); }
      else if (act === 'effects-osc')  { visStyleIdx = 1; updateEffectsMenu(); }
      else if (act === 'effects-pulse'){ visStyleIdx = 2; updateEffectsMenu(); }
      else if (act === 'scale-1') { visScaleIdx = 0; updateScale(); updateScaleMenu(); }
      else if (act === 'scale-2') { visScaleIdx = 1; updateScale(); updateScaleMenu(); }
      else if (act === 'scale-4') { visScaleIdx = 2; updateScale(); updateScaleMenu(); }
      else if (act === 'help-about') aboutDialog();
    });

    function updateEffectsMenu() {
      wrap.querySelectorAll('[data-effect]').forEach(el => {
        const k = el.dataset.effect;
        el.classList.toggle('checked', STYLES[visStyleIdx] === k);
      });
    }
    function updateScaleMenu() {
      wrap.querySelectorAll('[data-scaleopt]').forEach(el => {
        const k = parseInt(el.dataset.scaleopt, 10);
        el.classList.toggle('checked', SCALES[visScaleIdx] === k);
      });
    }
    function updateScale() {
      const s = SCALES[visScaleIdx];
      canvas.style.width = (baseW * s) + 'px';
      canvas.style.height = (baseH * s) + 'px';
    }
    updateEffectsMenu();
    updateScaleMenu();

    function beepDialog() {
      gagDialog('BEEP.\n\nThat function is disabled in this build.');
    }
    function gagDialog(msg) {
      const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(msg) + '</p></div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({ title: 'Mixtape', icon: cassetteIcon, width: 320, height: 160, resizable: false, contentHTML: html });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
      if (RW.Audio) RW.Audio.error();
    }
    function aboutDialog() {
      const html = '<div class="dialog-body">' +
        '<p><b>Mixtape</b></p>' +
        "<p>Rick's first mixtape. Burned to CD on his dad's 1999 Compaq.</p>" +
        '<p style="font-size:11px;color:#444">(c) 1999-2026 Rick Wayne</p>' +
        '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({ title: 'About Mixtape', icon: cassetteIcon, width: 340, height: 200, resizable: false, contentHTML: html });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
    }

    // === Engine subscriptions ===
    uiUnsub.push(Engine.onTrackChange((i) => {
      renderTrackList();
      renderMarquee(i);
    }));
    uiUnsub.push(Engine.onTrackEnd(() => {
      Engine.next();
    }));
    uiUnsub.push(Engine.onTick(() => {
      drawVisualizer();
      scrollMarquee();
      renderTime();
    }));

    // Marquee scroll
    let marqueeOffset = 0;
    function scrollMarquee() {
      marqueeOffset = (marqueeOffset + 0.6) % 1000;
      marquee.style.transform = 'translateX(' + (-marqueeOffset) + 'px)';
      if (marqueeOffset > marquee.offsetWidth - 50) marqueeOffset = 0;
    }

    function renderTime() {
      const cur = Engine.currentTime();
      const total = Engine.duration || 0;
      timeReadout.textContent = fmtTime(cur) + ' / ' + fmtTime(total);
    }

    function drawVisualizer() {
      if (!Engine.analyser) {
        // idle pattern: just a static scope line
        cctx.fillStyle = '#000';
        cctx.fillRect(0, 0, baseW, baseH);
        cctx.fillStyle = '#003300';
        for (let x = 0; x < baseW; x += 14) cctx.fillRect(x, 0, 1, baseH);
        for (let y = 0; y < baseH; y += 14) cctx.fillRect(0, y, baseW, 1);
        return;
      }
      const style = STYLES[visStyleIdx];
      cctx.fillStyle = '#000';
      cctx.fillRect(0, 0, baseW, baseH);

      if (style === 'bars') {
        Engine.analyser.getByteFrequencyData(Engine.freqData);
        const bars = 48;
        const step = Math.floor(Engine.freqData.length / bars);
        const bw = baseW / bars;
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += Engine.freqData[i * step + j];
          const v = sum / step;
          const h = (v / 255) * baseH;
          const grad = cctx.createLinearGradient(0, baseH - h, 0, baseH);
          grad.addColorStop(0, '#00ffff');
          grad.addColorStop(0.5, '#00b0c0');
          grad.addColorStop(1, '#003040');
          cctx.fillStyle = grad;
          cctx.fillRect(i * bw + 1, baseH - h, bw - 2, h);
        }
      } else if (style === 'oscilloscope') {
        // green grid
        cctx.strokeStyle = '#003300';
        cctx.lineWidth = 1;
        for (let x = 0; x < baseW; x += 14) { cctx.beginPath(); cctx.moveTo(x + 0.5, 0); cctx.lineTo(x + 0.5, baseH); cctx.stroke(); }
        for (let y = 0; y < baseH; y += 14) { cctx.beginPath(); cctx.moveTo(0, y + 0.5); cctx.lineTo(baseW, y + 0.5); cctx.stroke(); }
        Engine.analyser.getByteTimeDomainData(Engine.timeData);
        cctx.strokeStyle = '#00ff66';
        cctx.lineWidth = 1.6;
        cctx.beginPath();
        for (let i = 0; i < Engine.timeData.length; i++) {
          const v = (Engine.timeData[i] - 128) / 128;
          const x = (i / Engine.timeData.length) * baseW;
          const y = baseH / 2 + v * (baseH / 2 - 4);
          if (i === 0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
        }
        cctx.stroke();
      } else { // pulse
        Engine.analyser.getByteFrequencyData(Engine.freqData);
        let lowSum = 0;
        const lowBins = 16;
        for (let i = 0; i < lowBins; i++) lowSum += Engine.freqData[i];
        const energy = (lowSum / lowBins) / 255;
        const cx = baseW / 2;
        const cy = baseH / 2;
        const maxR = Math.min(baseW, baseH) / 2 - 2;
        const rings = 5;
        for (let r = 0; r < rings; r++) {
          const phase = (Date.now() / 800 + r * 0.18) % 1;
          const radius = phase * maxR + energy * 20;
          const alpha = (1 - phase) * (0.4 + energy * 0.6);
          cctx.strokeStyle = 'rgba(0,255,200,' + alpha.toFixed(3) + ')';
          cctx.lineWidth = 2;
          cctx.beginPath();
          cctx.arc(cx, cy, radius, 0, Math.PI * 2);
          cctx.stroke();
        }
        // core
        const core = 4 + energy * 12;
        cctx.fillStyle = 'rgba(255,255,255,' + (0.4 + energy * 0.6).toFixed(3) + ')';
        cctx.beginPath();
        cctx.arc(cx, cy, core, 0, Math.PI * 2);
        cctx.fill();
      }
    }
  };

  // === DOM template for the Mixtape window body ===
  function mixtapeHTML() {
    return (
      '<div class="mix-menubar">' +
        '<span class="mb-item" data-menu="file"><u>F</u>ile' +
          '<div class="mb-sub">' +
            '<div data-act="file-new">New</div>' +
            '<div data-act="file-open">Open...</div>' +
            '<div data-act="file-save">Save...</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="file-exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="edit"><u>E</u>dit' +
          '<div class="mb-sub">' +
            '<div data-act="edit-cut">Cut</div>' +
            '<div data-act="edit-copy">Copy</div>' +
            '<div data-act="edit-paste">Paste</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="effects"><u>E</u>ffects' +
          '<div class="mb-sub">' +
            '<div data-act="effects-bars"  data-effect="bars">Bars</div>' +
            '<div data-act="effects-osc"   data-effect="oscilloscope">Oscilloscope</div>' +
            '<div data-act="effects-pulse" data-effect="pulse">Pulse</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="scale"><u>S</u>cale' +
          '<div class="mb-sub">' +
            '<div data-act="scale-1" data-scaleopt="1">1x</div>' +
            '<div data-act="scale-2" data-scaleopt="2">2x</div>' +
            '<div data-act="scale-4" data-scaleopt="4">4x</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="help-about">About Mixtape</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="mix-marquee"><div id="mix-marquee-text" class="mix-marquee-inner">♪ Untitled Track 1 - TBD ♪   </div></div>' +
      '<div class="mix-visbox">' +
        '<canvas id="mix-vis" width="280" height="140" title="Click to cycle visualizer"></canvas>' +
      '</div>' +
      '<div class="mix-tracklist-wrap">' +
        '<div class="mix-tracklist-header">' +
          '<span class="mr-num">#</span>' +
          '<span class="mr-title">Title</span>' +
          '<span class="mr-artist">Artist</span>' +
          '<span class="mr-time">Time</span>' +
        '</div>' +
        '<div id="mix-tracklist" class="mix-tracklist"></div>' +
      '</div>' +
      '<div class="mix-controls">' +
        '<button id="mix-prev"  title="Previous">|&laquo;</button>' +
        '<button id="mix-play"  title="Play">&#9658;</button>' +
        '<button id="mix-pause" title="Pause">II</button>' +
        '<button id="mix-stop"  title="Stop">&#9632;</button>' +
        '<button id="mix-next"  title="Next">&raquo;|</button>' +
        '<span class="mix-vol-wrap"><label>Vol</label><input id="mix-vol" type="range" min="0" max="100" value="60"></span>' +
        '<span id="mix-time" class="mix-time">0:00 / 0:00</span>' +
      '</div>'
    );
  }

  function wireMenu(wrap, handler) {
    const items = wrap.querySelectorAll('.mix-menubar .mb-item');
    items.forEach(mb => {
      mb.addEventListener('click', (e) => {
        items.forEach(x => { if (x !== mb) x.classList.remove('open'); });
        mb.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      items.forEach(x => x.classList.remove('open'));
    });
    wrap.querySelectorAll('.mix-menubar .mb-sub div').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(x => x.classList.remove('open'));
        const act = d.dataset.act;
        if (act) handler(act);
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  // === Mixtape desktop icon (cassette) ===
  function mixtapeIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32">' +
      '<rect x="2" y="6"  width="28" height="20" fill="#c0c0c0" stroke="#000"/>' +
      '<rect x="4" y="9"  width="24" height="12" fill="#101820" stroke="#000"/>' +
      '<circle cx="11" cy="15" r="2.6" fill="#c0c0c0" stroke="#000"/>' +
      '<circle cx="21" cy="15" r="2.6" fill="#c0c0c0" stroke="#000"/>' +
      '<rect x="3" y="22" width="26" height="3" fill="#808080" stroke="#000"/>' +
      '<rect x="6" y="10" width="20" height="2" fill="#ff8c00"/>' +
      '<text x="16" y="20" font-family="monospace" font-size="4.5" text-anchor="middle" fill="#fff">MIXTAPE</text>' +
      '</svg>';
  }
  Mix.icon = mixtapeIcon;
})();
