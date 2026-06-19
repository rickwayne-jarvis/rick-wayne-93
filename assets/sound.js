// RICK WAYNE 93 - sound.js
// Synthesized chimes via Web Audio. No binary files shipped.
// Default OFF. Toggle in the system tray.

(function () {
  const Sound = {
    enabled: false,
    ctx: null,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { this.ctx = null; }
    },

    enable() {
      this.enabled = true;
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    disable() {
      this.enabled = false;
    },

    toggle() {
      this.enabled ? this.disable() : this.enable();
      return this.enabled;
    },

    // Single tone helper
    _tone(freq, dur, type, gain, when) {
      if (!this.enabled || !this.ctx) return;
      const t0 = (when || 0) + this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    // Boot chime: a small ascending shimmer reminiscent of the era,
    // not a copy of any specific OS sound.
    boot() {
      if (!this.enabled) { return; }
      this.init();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime + 0.05;
      // Pad
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((f, i) => {
        this._tone(f, 1.4, 'triangle', 0.07, 0.05 + i * 0.1);
      });
      // Sparkle
      this._tone(1046.5, 0.5, 'sine', 0.06, 0.5);
      this._tone(1318.5, 0.4, 'sine', 0.05, 0.65);
      this._tone(1568.0, 0.3, 'sine', 0.04, 0.8);
    },

    click() {
      if (!this.enabled || !this.ctx) return;
      // Short noise burst
      const ctx = this.ctx;
      const buf = ctx.createBuffer(1, 1100, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
      }
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = 0.12;
      src.buffer = buf;
      src.connect(g).connect(ctx.destination);
      src.start();
    },

    openWindow() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      this._tone(440, 0.06, 'square', 0.05, 0);
      this._tone(660, 0.06, 'square', 0.05, 0.05);
      this._tone(880, 0.06, 'square', 0.04, 0.1);
    },

    closeWindow() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      this._tone(660, 0.07, 'square', 0.05, 0);
      this._tone(330, 0.09, 'square', 0.05, 0.06);
    },

    error() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      this._tone(180, 0.15, 'sawtooth', 0.18, 0);
      this._tone(120, 0.25, 'sawtooth', 0.16, 0.15);
    }
  };

  window.Sound = Sound;
})();
