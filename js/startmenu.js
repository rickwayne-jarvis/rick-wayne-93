/* startmenu.js - Start button + menu */

(function () {
  const RW = window.RW = window.RW || {};
  const SM = RW.StartMenu = {};

  let open = false;
  let documents = [];

  function btn() { return document.getElementById('start-btn'); }
  function menu() { return document.getElementById('start-menu'); }

  function openMenu() {
    if (open) return;
    open = true;
    menu().hidden = false;
    btn().classList.add('active');
    if (RW.Audio) RW.Audio.click();
  }
  function closeMenu() {
    if (!open) return;
    open = false;
    menu().hidden = true;
    btn().classList.remove('active');
  }
  function toggle() { open ? closeMenu() : openMenu(); }
  SM.toggle = toggle;
  SM.open = openMenu;
  SM.close = closeMenu;

  SM.touchDocument = function (label) {
    documents = [label, ...documents.filter(x => x !== label)].slice(0, 8);
    renderDocs();
  };
  function renderDocs() {
    const ul = document.getElementById('sub-documents');
    ul.innerHTML = '';
    if (!documents.length) {
      const li = document.createElement('li'); li.className = 'start-item disabled';
      li.innerHTML = '<span class="si-label">(empty)</span>'; ul.appendChild(li);
      return;
    }
    documents.forEach(d => {
      const li = document.createElement('li');
      li.className = 'start-item';
      li.innerHTML = '<span class="si-ico">[T]</span><span class="si-label">' + RW.WM.escapeHtml(d) + '</span>';
      ul.appendChild(li);
    });
  }

  // 7-click easter egg on start logo
  let logoClicks = 0;
  let logoTimer = null;
  function openAboutWindows() {
    const html = '<div class="about-w95">' +
      '<div class="flag-big"><span></span><span></span><span></span><span></span></div>' +
      '<h3>Microsoft Windows 95</h3>' +
      '<p>Rick Wayne edition</p>' +
      '<p style="margin:10px 0">This system: Rick Wayne, Director.<br>Brain trust: probably his actual brain.<br>Easter eggs: more than this one.</p>' +
      '<p style="font-size:11px;color:#444">Copyright (c) 1995-2026 Rick Wayne. Built with Vanilla JS, Web Audio, and good faith.</p>' +
      '</div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'About Windows 95', icon: RW.ICONS.computer,
      width: 380, height: 320, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
    if (RW.Audio) RW.Audio.ding();
  }

  function init() {
    const b = btn();
    b.addEventListener('click', (e) => {
      const onLogo = !!e.target.closest('.start-logo');
      if (onLogo) {
        logoClicks++;
        clearTimeout(logoTimer);
        logoTimer = setTimeout(() => { logoClicks = 0; }, 3000);
        if (logoClicks >= 7) {
          logoClicks = 0;
          openAboutWindows();
          closeMenu();
          return;
        }
      }
      toggle();
    });

    document.addEventListener('click', (e) => {
      if (!open) return;
      if (e.target.closest('#start-menu')) return;
      if (e.target.closest('#start-btn')) return;
      closeMenu();
    });

    // Menu item clicks
    menu().addEventListener('click', (e) => {
      const li = e.target.closest('.start-item');
      if (!li) return;
      if (li.classList.contains('has-sub')) return; // submenus
      if (li.classList.contains('disabled')) return;
      const act = li.dataset.action;
      const label = li.dataset.label || '';
      e.stopPropagation();
      if (!act) return;
      handleAction(act, label);
      closeMenu();
    });

    renderDocs();
  }

  function handleAction(act, label) {
    switch (act) {
      case 'open-work':         RW.Explorer.openWork(); break;
      case 'open-press':        RW.Explorer.openPress(); break;
      case 'open-minesweeper':  RW.Minesweeper.open(); break;
      case 'open-solitaire':    RW.Solitaire.open(); break;
      case 'open-calculator':   RW.Calculator.open(); break;
      case 'open-paint':        RW.Paint.open(); break;
      case 'open-moviemaker':   RW.MovieMaker.open(); break;
      case 'open-music':        RW.Music.open(); break;
      case 'open-ie':           RW.IE.open(); break;
      case 'open-control-panel': RW.Desktop.openControlPanel && RW.Desktop.openControlPanel(); break;
      case 'open-about':        RW.Desktop.openAbout(); break;
      case 'open-contact':      RW.Desktop.openContact(); break;
      case 'open-display-properties': RW.Desktop.openDisplayProperties(); break;
      case 'open-help':         RW.Desktop.openHelp(); break;
      case 'open-run':          RW.Desktop.openRun(); break;
      case 'open-shutdown':     RW.Desktop.openShutdown(); break;
      case 'toggle-sound':      RW.Desktop.toggleSound(); break;
      default: break;
    }
  }

  document.addEventListener('rw:desktop-ready', init);
})();
