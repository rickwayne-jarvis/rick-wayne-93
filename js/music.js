/* music.js - Sound Recorder mixtape with 5 synthesized loops */

(function () {
  const RW = window.RW = window.RW || {};
  const Music = RW.Music = {};
  const ID = 'music';

  // ===== Track definitions =====
  // Each track: { title, bpm, leadType, leadOctave, chords (array of arrays of midi notes),
  //               bassPattern, drumPattern, melodyPattern (per-beat step index into chord pool) }
  // We synthesize using a single AudioContext when user gestures Play.

  const TRACKS = [
    {
      title: 'First Day Of Summer',
      bpm: 132,
      key: 60, // C major
      leadType: 'square',
      progression: [
        [60, 64, 67],          // C
        [67, 71, 74],          // G
        [69, 72, 76],          // Am
        [65, 69, 72]           // F
      ],
      bass: [-12, -12, -5, -7],
      melody: [
        [72, 76, 79, 76, 72, 79, 76, 74],
        [74, 78, 81, 78, 74, 81, 78, 76],
        [76, 79, 84, 79, 76, 81, 79, 76],
        [77, 81, 84, 81, 77, 84, 81, 77]
      ],
      kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
      snarePattern:[0, 0, 1, 0, 0, 0, 1, 0],
      hatPattern:  [1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
      title: 'Camera Battery Dying',
      bpm: 90,
      key: 57,
      leadType: 'sawtooth',
      progression: [
        [57, 60, 64],          // Am
        [62, 65, 69],          // Dm
        [55, 59, 62],          // G
        [60, 64, 67]           // C
      ],
      bass: [-12, -7, -5, 0],
      melody: [
        [69, 67, 65, 64, 65, 67, 65, 64],
        [70, 69, 67, 65, 67, 69, 67, 65],
        [67, 65, 64, 62, 64, 65, 64, 62],
        [64, 65, 67, 65, 64, 62, 60, 60]
      ],
      kickPattern: [1, 0, 0, 0, 0, 0, 1, 0],
      snarePattern:[0, 0, 1, 0, 0, 0, 0, 1],
      hatPattern:  [1, 0, 1, 0, 1, 0, 1, 0]
    },
    {
      title: "Mom's Basement Studio",
      bpm: 108,
      key: 62,
      leadType: 'triangle',
      progression: [
        [62, 65, 69],          // Dm
        [60, 64, 67],          // C
        [67, 71, 74],          // G
        [69, 72, 76]           // Am
      ],
      bass: [-10, -12, -5, -3],
      melody: [
        [74, 77, 81, 77, 74, 81, 77, 74],
        [72, 76, 79, 76, 72, 79, 76, 72],
        [79, 76, 74, 71, 74, 76, 79, 81],
        [76, 79, 81, 79, 76, 81, 79, 76]
      ],
      kickPattern: [1, 0, 0, 1, 0, 0, 1, 0],
      snarePattern:[0, 0, 1, 0, 0, 0, 1, 0],
      hatPattern:  [1, 1, 0, 1, 1, 1, 0, 1]
    },
    {
      title: 'Edit Bay 2AM',
      bpm: 72,
      key: 57,
      leadType: 'triangle',
      progression: [
        [57, 60, 64],          // Am
        [60, 64, 67],          // C
        [62, 65, 69],          // Dm
        [64, 67, 71]           // Em
      ],
      bass: [-12, -9, -7, -5],
      melody: [
        [69, 72, 76, 72, 71, 69, 67, 65],
        [72, 76, 79, 76, 74, 72, 71, 67],
        [74, 77, 81, 77, 76, 74, 72, 69],
        [76, 79, 83, 79, 78, 76, 74, 71]
      ],
      kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
      snarePattern:[0, 0, 0, 0, 0, 0, 1, 0],
      hatPattern:  [0, 1, 0, 1, 0, 1, 0, 1]
    },
    {
      title: 'Premiere',
      bpm: 144,
      key: 60,
      leadType: 'square',
      progression: [
        [60, 64, 67],          // C
        [65, 69, 72],          // F
        [67, 71, 74],          // G
        [60, 64, 67]           // C
      ],
      bass: [-12, -7, -5, -12],
      melody: [
        [72, 76, 79, 84, 79, 76, 79, 72],
        [77, 81, 84, 89, 84, 81, 84, 77],
        [79, 83, 86, 91, 86, 83, 86, 79],
        [84, 79, 76, 72, 76, 79, 84, 88]
      ],
      kickPattern: [1, 0, 1, 0, 1, 0, 1, 0],
      snarePattern:[0, 0, 1, 0, 0, 0, 1, 0],
      hatPattern:  [1, 1, 1, 1, 1, 1, 1, 1]
    }
  ];

  // ===== Audio context (lazy) =====
  let ctx = null;
  let masterGain = null;
  let currentSchedulerId = null;
  let scheduledStop = null;
  let trackIdx = 0;
  let playing = false;
  let volume = 0.6;

  function ensureCtx() {
    if (ctx) return ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function playTone(freq, time, dur, opts) {
    opts = opts || {};
    const o = ctx.createOscillator();
    o.type = opts.type || 'square';
    o.frequency.setValueAtTime(freq, time);
    const g = ctx.createGain();
    const vol = opts.vol != null ? opts.vol : 0.18;
    const attack = opts.attack != null ? opts.attack : 0.01;
    const release = opts.release != null ? opts.release : 0.08;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + attack);
    g.gain.linearRampToValueAtTime(vol * 0.7, time + Math.min(dur, attack + 0.05));
    g.gain.linearRampToValueAtTime(0, time + dur + release);
    o.connect(g);
    g.connect(masterGain);
    o.start(time);
    o.stop(time + dur + release + 0.05);
  }

  function playNoise(time, dur, opts) {
    opts = opts || {};
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(sr * dur)), sr);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = opts.filterType || 'bandpass';
    filt.frequency.value = opts.freq || 4000;
    filt.Q.value = opts.q || 1;
    const g = ctx.createGain();
    const vol = opts.vol != null ? opts.vol : 0.15;
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  function playKick(time) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    const g = ctx.createGain();
    o.frequency.setValueAtTime(120, time);
    o.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    g.gain.setValueAtTime(0.4, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    o.connect(g); g.connect(masterGain);
    o.start(time); o.stop(time + 0.22);
  }
  function playSnare(time) {
    playNoise(time, 0.12, { freq: 2000, q: 0.7, vol: 0.18, filterType: 'highpass' });
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    o.connect(g); g.connect(masterGain);
    o.start(time); o.stop(time + 0.12);
  }
  function playHat(time) {
    playNoise(time, 0.04, { freq: 8000, q: 1.4, vol: 0.06, filterType: 'highpass' });
  }

  // Scheduler: precompute one bar at a time
  function startTrack(idx) {
    if (!ensureCtx()) return;
    stopTrack();
    trackIdx = idx;
    playing = true;
    const t = TRACKS[idx];
    const beatDur = 60 / t.bpm / 2; // 8 beats per bar
    let bar = 0;
    let nextBarTime = ctx.currentTime + 0.1;

    function scheduleBar() {
      if (!playing) return;
      const tt = nextBarTime;
      const chordIdx = bar % t.progression.length;
      const chord = t.progression[chordIdx];
      const bassMidi = (t.key) + t.bass[chordIdx];
      const melody = t.melody[chordIdx];

      // Chord pad on each downbeat
      chord.forEach(n => {
        playTone(midiToFreq(n), tt, beatDur * 7.5, { type: 'triangle', vol: 0.05, attack: 0.05, release: 0.4 });
      });
      // Bass on beats 0 and 4
      playTone(midiToFreq(bassMidi), tt, beatDur * 1.5, { type: 'sawtooth', vol: 0.12, attack: 0.005, release: 0.1 });
      playTone(midiToFreq(bassMidi), tt + beatDur * 4, beatDur * 1.5, { type: 'sawtooth', vol: 0.10, attack: 0.005, release: 0.1 });

      // Lead melody, 8 steps per bar
      for (let i = 0; i < 8; i++) {
        const beat = tt + i * beatDur;
        playTone(midiToFreq(melody[i]), beat, beatDur * 0.85, {
          type: t.leadType, vol: 0.10, attack: 0.005, release: 0.05
        });
        if (t.kickPattern[i])  playKick(beat);
        if (t.snarePattern[i]) playSnare(beat);
        if (t.hatPattern[i])   playHat(beat);
      }

      bar++;
      nextBarTime = tt + beatDur * 8;
    }

    function loop() {
      if (!playing) return;
      const lookahead = 0.5; // seconds
      while (nextBarTime - ctx.currentTime < lookahead) {
        scheduleBar();
      }
      currentSchedulerId = setTimeout(loop, 80);
    }
    loop();
  }

  function stopTrack() {
    playing = false;
    if (currentSchedulerId) { clearTimeout(currentSchedulerId); currentSchedulerId = null; }
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.value = volume;
  }

  // ===== UI =====
  Music.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    const wrap = document.createElement('div');
    wrap.className = 'sr-body';
    wrap.innerHTML =
      '<div class="sr-tracklist">' +
        TRACKS.map((t, i) => '<div class="sr-track" data-idx="' + i + '">' +
          '<span class="sr-num">' + (i + 1) + '.</span>' +
          '<span class="sr-title">' + RW.WM.escapeHtml(t.title) + '</span>' +
        '</div>').join('') +
      '</div>' +
      '<div class="sr-display">' +
        '<div class="sr-now">Now playing: <span data-now>(stopped)</span></div>' +
        '<div class="sr-wave"><div class="sr-wave-fill" data-wave></div></div>' +
      '</div>' +
      '<div class="sr-controls">' +
        '<button class="sr-btn" data-act="prev" title="Previous">|&#9664;</button>' +
        '<button class="sr-btn sr-play" data-act="play" title="Play">&#9654;</button>' +
        '<button class="sr-btn" data-act="pause" title="Pause">&#10074;&#10074;</button>' +
        '<button class="sr-btn" data-act="stop" title="Stop">&#9632;</button>' +
        '<button class="sr-btn" data-act="next" title="Next">&#9654;|</button>' +
        '<div class="sr-vol-wrap"><label>Vol</label><input type="range" min="0" max="100" value="' + Math.round(volume * 100) + '" data-vol></div>' +
      '</div>';

    const w = RW.WM.open({
      id: ID,
      title: "Sound Recorder - Rick's First Mixtape 2003",
      icon: RW.ICONS.music,
      width: 360, height: 280, resizable: false,
      contentNode: wrap,
      onClose: () => { stopTrack(); }
    });
    w.body.style.padding = '0';

    const nowEl = wrap.querySelector('[data-now]');
    const waveEl = wrap.querySelector('[data-wave]');
    const trackEls = wrap.querySelectorAll('.sr-track');
    let waveAnim = null;

    function selectTrack(i) {
      trackIdx = i;
      trackEls.forEach((el, ii) => el.classList.toggle('selected', ii === i));
    }
    function showNow() {
      nowEl.textContent = playing ? TRACKS[trackIdx].title : '(stopped)';
    }
    function animateWave() {
      if (waveAnim) { cancelAnimationFrame(waveAnim); waveAnim = null; }
      function step() {
        if (!playing) { waveEl.style.width = '6%'; return; }
        const t = Date.now() / 200;
        const v = 30 + Math.sin(t) * 18 + Math.cos(t * 1.7) * 14;
        waveEl.style.width = Math.max(6, Math.min(96, v)) + '%';
        waveAnim = requestAnimationFrame(step);
      }
      step();
    }

    trackEls.forEach((el, i) => {
      el.addEventListener('click', () => selectTrack(i));
      el.addEventListener('dblclick', () => {
        selectTrack(i);
        ensureCtx();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        startTrack(i);
        showNow();
        animateWave();
      });
    });
    selectTrack(0);

    wrap.querySelectorAll('.sr-btn').forEach(b => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        ensureCtx();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        if (act === 'play')      { startTrack(trackIdx); showNow(); animateWave(); }
        else if (act === 'stop') { stopTrack(); showNow(); waveEl.style.width = '6%'; }
        else if (act === 'pause'){ stopTrack(); showNow(); }
        else if (act === 'prev') { selectTrack((trackIdx - 1 + TRACKS.length) % TRACKS.length); if (playing) { startTrack(trackIdx); showNow(); } }
        else if (act === 'next') { selectTrack((trackIdx + 1) % TRACKS.length); if (playing) { startTrack(trackIdx); showNow(); } }
      });
    });

    const volEl = wrap.querySelector('[data-vol]');
    volEl.addEventListener('input', () => setVolume(volEl.value / 100));

    showNow();
    animateWave();
  };
})();
