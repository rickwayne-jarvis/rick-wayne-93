/* audio.js - Web Audio synthesis. No binary audio files. */

(function () {
  const RW = window.RW = window.RW || {};
  const Audio = RW.Audio = {};

  let ctx = null;
  let masterGain = null;
  let enabled = false;
  let reverb = null;

  function ensureCtx() {
    if (ctx) return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = enabled ? 0.5 : 0;
    masterGain.connect(ctx.destination);

    // Tiny convolution reverb made from synthesized noise
    try {
      const sr = ctx.sampleRate;
      const len = Math.floor(sr * 0.8);
      const buf = ctx.createBuffer(2, len, sr);
      for (let c = 0; c < 2; c++) {
        const ch = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
          ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        }
      }
      reverb = ctx.createConvolver();
      reverb.buffer = buf;
      reverb.connect(masterGain);
    } catch (e) {
      reverb = null;
    }
    return ctx;
  }

  Audio.setEnabled = function (on) {
    enabled = !!on;
    if (masterGain) masterGain.gain.value = enabled ? 0.5 : 0;
  };
  Audio.isEnabled = function () { return enabled; };
  Audio.resume = function () {
    ensureCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };

  function tone(freq, dur, opts) {
    ensureCtx();
    if (!ctx || !enabled) return;
    opts = opts || {};
    const type = opts.type || 'square';
    const vol = opts.vol != null ? opts.vol : 0.18;
    const attack = opts.attack != null ? opts.attack : 0.005;
    const decay = opts.decay != null ? opts.decay : 0.05;
    const wet = opts.wet != null ? opts.wet : 0;
    const now = ctx.currentTime + (opts.delay || 0);

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + attack);
    g.gain.linearRampToValueAtTime(0, now + attack + dur + decay);

    osc.connect(g);
    g.connect(masterGain);
    if (wet > 0 && reverb) {
      const w = ctx.createGain();
      w.gain.value = wet;
      g.connect(w);
      w.connect(reverb);
    }
    osc.start(now);
    osc.stop(now + attack + dur + decay + 0.05);
  }
  Audio.tone = tone;

  function noise(dur, opts) {
    ensureCtx();
    if (!ctx || !enabled) return;
    opts = opts || {};
    const vol = opts.vol != null ? opts.vol : 0.12;
    const now = ctx.currentTime + (opts.delay || 0);
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType || 'bandpass';
    filter.frequency.value = opts.freq || 2000;
    filter.Q.value = opts.q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.linearRampToValueAtTime(0, now + dur);
    src.connect(filter); filter.connect(g); g.connect(masterGain);
    src.start(now); src.stop(now + dur + 0.02);
  }
  Audio.noise = noise;

  Audio.startup = function () {
    // ascending arpeggio with reverb wash
    if (!enabled) return;
    const notes = [392, 523.25, 659.25, 783.99]; // G4 C5 E5 G5
    let t = 0;
    notes.forEach((f, i) => {
      tone(f, 0.18, { type: 'triangle', vol: 0.22, decay: 0.25, wet: 0.6, delay: t });
      t += 0.12;
    });
    tone(1046.5, 0.5, { type: 'triangle', vol: 0.18, decay: 0.6, wet: 0.7, delay: t });
  };

  Audio.click = function () {
    if (!enabled) return;
    noise(0.03, { vol: 0.08, freq: 4000, q: 2 });
  };

  Audio.dblclick = function () {
    if (!enabled) return;
    tone(2000, 0.02, { type: 'square', vol: 0.06 });
    tone(2400, 0.02, { type: 'square', vol: 0.06, delay: 0.04 });
  };

  Audio.error = function () {
    if (!enabled) return;
    tone(440, 0.16, { type: 'square', vol: 0.18 });
    tone(330, 0.22, { type: 'square', vol: 0.18, delay: 0.18 });
  };

  Audio.ding = function () {
    if (!enabled) return;
    tone(880, 0.08, { type: 'triangle', vol: 0.16, decay: 0.25, wet: 0.4 });
    tone(1320, 0.12, { type: 'triangle', vol: 0.14, decay: 0.3, wet: 0.4, delay: 0.04 });
  };

  Audio.shutdown = function () {
    if (!enabled) return;
    const notes = [659.25, 523.25, 392, 261.63];
    let t = 0;
    notes.forEach(f => {
      tone(f, 0.16, { type: 'triangle', vol: 0.18, decay: 0.2, wet: 0.5, delay: t });
      t += 0.12;
    });
  };

  Audio.minesweeperReveal = function () {
    if (!enabled) return;
    tone(1200, 0.02, { type: 'square', vol: 0.05 });
  };
  Audio.minesweeperBoom = function () {
    if (!enabled) return;
    noise(0.4, { vol: 0.3, freq: 100, q: 0.5, filterType: 'lowpass' });
    tone(80, 0.4, { type: 'sawtooth', vol: 0.2, decay: 0.5 });
  };
  Audio.minesweeperWin = function () {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    let t = 0;
    notes.forEach(f => {
      tone(f, 0.12, { type: 'triangle', vol: 0.2, decay: 0.2, wet: 0.4, delay: t });
      t += 0.1;
    });
  };
})();
