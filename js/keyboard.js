/* keyboard.js - global keyboard shortcuts */

(function () {
  const RW = window.RW = window.RW || {};

  document.addEventListener('keydown', (e) => {
    // Ignore inputs and textareas for non-system keys
    const inField = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

    // Alt+F4 close active window
    if (e.altKey && e.key === 'F4') {
      e.preventDefault();
      RW.WM.closeActive();
      return;
    }

    // Alt+Tab cycle
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      RW.WM.cycleAltTab();
      return;
    }

    // F5 refresh desktop (just click sound)
    if (e.key === 'F5' && !inField) {
      e.preventDefault();
      if (RW.Audio) RW.Audio.click();
      return;
    }

    // F2 rename gag
    if (e.key === 'F2' && !inField) {
      e.preventDefault();
      RW.Easter.rename();
      return;
    }
  });
})();
