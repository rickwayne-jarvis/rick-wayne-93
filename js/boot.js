/* boot.js - boot sequence */

(function () {
  const SKIP_KEY = 'rw93_booted_v2';
  const bootScreen = document.getElementById('boot-screen');
  const stage1 = document.getElementById('boot-stage-1');
  const stage2 = document.getElementById('boot-stage-2');
  const bootText = document.getElementById('boot-text');
  const progressBar = document.getElementById('boot-progress-bar');
  const desktop = document.getElementById('desktop');

  let skipped = false;
  let timers = [];

  function clearAll() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  }

  function later(fn, ms) {
    const t = setTimeout(() => { if (!skipped) fn(); }, ms);
    timers.push(t);
    return t;
  }

  function showDesktop() {
    skipped = true;
    clearAll();
    bootScreen.style.display = 'none';
    desktop.hidden = false;
    document.body.classList.add('booted');
    try { sessionStorage.setItem(SKIP_KEY, '1'); } catch (e) {}
    // signal other modules
    document.dispatchEvent(new CustomEvent('rw:desktop-ready'));
  }

  function skipBoot(e) {
    if (skipped) return;
    // attempt to unlock audio on key
    if (window.RW && RW.Audio) RW.Audio.resume();
    showDesktop();
  }

  function startBoot(skipChime) {
    // v9: skip the BIOS POST text entirely. Go straight to the iconic
    // Windows clouds "Loading Rick's Nostalgia" screen. Stage 1 is hidden
    // before paint via the inline style block in index.html.
    if (stage1) stage1.hidden = true;
    if (bootText) bootText.textContent = '';
    toStage2();
  }

  function toStage2() {
    if (skipped) return;
    stage1.hidden = true;
    stage2.hidden = false;
    // Try to play startup chime if audio is enabled
    if (window.RW && RW.Audio) RW.Audio.startup();
    // Progress bar over 2.5s
    const start = Date.now();
    const dur = 2400;
    function step() {
      if (skipped) return;
      const p = Math.min(1, (Date.now() - start) / dur);
      progressBar.style.width = (p * 100) + '%';
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        later(showDesktop, 250);
      }
    }
    step();
  }

  function init() {
    let alreadyBooted = false;
    try { alreadyBooted = sessionStorage.getItem(SKIP_KEY) === '1'; } catch (e) {}

    if (alreadyBooted) {
      showDesktop();
      return;
    }

    document.addEventListener('keydown', skipBoot, { once: true });
    bootScreen.addEventListener('click', skipBoot, { once: true });
    startBoot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
