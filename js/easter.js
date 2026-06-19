/* easter.js - BSOD, Konami code, rename gag */

(function () {
  const RW = window.RW = window.RW || {};
  const E = RW.Easter = {};

  E.bsod = function () {
    const el = document.getElementById('bsod');
    el.hidden = false;
    if (RW.Audio) RW.Audio.error();
    function dismiss() {
      el.hidden = true;
      document.removeEventListener('keydown', dismiss);
      el.removeEventListener('click', dismiss);
    }
    document.addEventListener('keydown', dismiss);
    el.addEventListener('click', dismiss);
  };

  E.rename = function () {
    const html = '<div class="dialog-body"><p>Rename to what, exactly?</p><p style="font-size:11px;color:#666">This icon is load-bearing.</p></div><div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Rename', icon: RW.ICONS.text,
      width: 320, height: 180, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  };

  // Konami code: up up down down left right left right b a
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    const expected = sequence[pos];
    if (k.toLowerCase() === expected.toLowerCase()) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        triggerKonami();
      }
    } else {
      pos = (k === sequence[0]) ? 1 : 0;
    }
  });

  function triggerKonami() {
    document.body.classList.add('crt-shake');
    if (RW.Audio) {
      RW.Audio.ding();
      setTimeout(() => RW.Audio.ding(), 200);
    }
    setTimeout(() => {
      document.body.classList.remove('crt-shake');
    }, 1200);
  }
})();
