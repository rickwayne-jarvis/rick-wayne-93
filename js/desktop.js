/* desktop.js - desktop icons, clock, sound toggle, system dialogs */

(function () {
  const RW = window.RW = window.RW || {};
  const Desktop = RW.Desktop = {};

  // Bitmap icons as inline SVG strings
  const ICONS = RW.ICONS = {
    folder: '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M2 8h10l3 3h15v17H2z" fill="#ffcc00" stroke="#000"/><path d="M2 11h28v17H2z" fill="#ffcc00" stroke="#000"/></svg>',
    text: '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M6 2h16l6 6v22H6z" fill="#fff" stroke="#000"/><path d="M22 2v6h6" fill="#dfdfdf" stroke="#000"/><line x1="9" y1="13" x2="25" y2="13" stroke="#000"/><line x1="9" y1="17" x2="25" y2="17" stroke="#000"/><line x1="9" y1="21" x2="22" y2="21" stroke="#000"/></svg>',
    mail: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="8" width="26" height="18" fill="#fff" stroke="#000"/><path d="M3 8l13 9 13-9" fill="none" stroke="#000"/><path d="M3 26l11-9 M29 26l-11-9" fill="none" stroke="#000"/></svg>',
    exe: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="3" width="26" height="26" fill="#c0c0c0" stroke="#000"/><rect x="3" y="3" width="26" height="4" fill="#000080"/><rect x="6" y="10" width="20" height="16" fill="#fff" stroke="#000"/><text x="16" y="22" font-family="monospace" font-size="9" text-anchor="middle" fill="#000">EXE</text></svg>',
    mine: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="3" width="26" height="26" fill="#c0c0c0" stroke="#000"/><circle cx="16" cy="18" r="6" fill="#000"/><rect x="14" y="9" width="4" height="6" fill="#000"/><rect x="22" y="13" width="2" height="4" fill="#ff0000"/></svg>',
    computer: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="5" width="26" height="18" fill="#c0c0c0" stroke="#000"/><rect x="5" y="7" width="22" height="13" fill="#000080"/><rect x="10" y="23" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="7" y="26" width="18" height="3" fill="#c0c0c0" stroke="#000"/></svg>',
    recycle: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="6" y="9" width="20" height="20" fill="#c0c0c0" stroke="#000"/><rect x="6" y="9" width="20" height="3" fill="#a0a0a0" stroke="#000"/><rect x="4" y="6" width="24" height="3" fill="#c0c0c0" stroke="#000"/><rect x="13" y="4" width="6" height="2" fill="#c0c0c0" stroke="#000"/><line x1="11" y1="14" x2="11" y2="26" stroke="#000"/><line x1="16" y1="14" x2="16" y2="26" stroke="#000"/><line x1="21" y1="14" x2="21" y2="26" stroke="#000"/></svg>',
    video: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="26" height="20" fill="#000080" stroke="#000"/><polygon points="13,11 13,21 22,16" fill="#fff"/><rect x="3" y="6" width="3" height="20" fill="#000"/><rect x="26" y="6" width="3" height="20" fill="#000"/><circle cx="4.5" cy="9" r="0.6" fill="#fff"/><circle cx="4.5" cy="13" r="0.6" fill="#fff"/><circle cx="4.5" cy="17" r="0.6" fill="#fff"/><circle cx="4.5" cy="21" r="0.6" fill="#fff"/><circle cx="27.5" cy="9" r="0.6" fill="#fff"/><circle cx="27.5" cy="13" r="0.6" fill="#fff"/><circle cx="27.5" cy="17" r="0.6" fill="#fff"/><circle cx="27.5" cy="21" r="0.6" fill="#fff"/></svg>',
    shortcut: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="5" y="3" width="20" height="26" fill="#fff" stroke="#000"/><rect x="5" y="3" width="20" height="3" fill="#000080"/><polygon points="20,22 26,22 22,28" fill="#fff" stroke="#000"/></svg>',
    network: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="14" height="10" fill="#c0c0c0" stroke="#000"/><rect x="15" y="16" width="14" height="10" fill="#c0c0c0" stroke="#000"/><line x1="10" y1="16" x2="22" y2="16" stroke="#000"/></svg>'
  };

  // Desktop icons config - left column, authentic Win95 order
  const desktopIcons = [
    { id: 'mycomp',   label: 'My Computer',     icon: ICONS.computer, action: () => openMyComputer() },
    { id: 'work',     label: 'WORK',            icon: ICONS.folder,   action: () => RW.Explorer.openWork() },
    { id: 'press',    label: 'PRESS',           icon: ICONS.folder,   action: () => RW.Explorer.openPress() },
    { id: 'about',    label: 'ABOUT ME.txt',    icon: ICONS.text,     action: () => openAbout() },
    { id: 'contact',  label: 'CONTACT.eml',     icon: ICONS.mail,     action: () => openContact() },
    { id: 'mine',     label: 'MINESWEEPER.exe', icon: ICONS.mine,     action: () => RW.Minesweeper.open() },
    { id: 'recycle',  label: 'Recycle Bin',     icon: ICONS.recycle,  action: () => openRecycle() }
  ];

  function buildIcons() {
    const ul = document.getElementById('desktop-icons');
    ul.innerHTML = '';
    desktopIcons.forEach(cfg => {
      const li = document.createElement('li');
      li.className = 'desktop-icon';
      li.dataset.iconId = cfg.id;
      li.innerHTML = '<div class="icon-img">' + cfg.icon + '</div><div class="icon-label">' + cfg.label + '</div>';
      let lastClick = 0;
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.desktop-icon.selected').forEach(x => x.classList.remove('selected'));
        li.classList.add('selected');
        if (RW.Audio) RW.Audio.click();
      });
      li.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (RW.Audio) RW.Audio.dblclick();
        cfg.action();
      });
      ul.appendChild(li);
    });

    // Click empty desktop to deselect
    document.getElementById('desktop-surface').addEventListener('click', (e) => {
      if (e.target.closest('.desktop-icon')) return;
      if (e.target.closest('.window')) return;
      document.querySelectorAll('.desktop-icon.selected').forEach(x => x.classList.remove('selected'));
    });
  }

  function startClock() {
    const el = document.getElementById('clock');
    function tick() {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12; if (h === 0) h = 12;
      el.textContent = h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    }
    tick();
    setInterval(tick, 30000);
  }

  function setupSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    const on = document.getElementById('sound-icon-on');
    const off = document.getElementById('sound-icon-off');
    function render() {
      const enabled = RW.Audio.isEnabled();
      on.hidden = !enabled;
      off.hidden = enabled;
      btn.title = enabled ? 'Sound: ON' : 'Sound: OFF (click to enable)';
    }
    btn.addEventListener('click', () => {
      RW.Audio.resume();
      RW.Audio.setEnabled(!RW.Audio.isEnabled());
      render();
      RW.Audio.ding();
    });
    Desktop.toggleSound = () => {
      RW.Audio.resume();
      RW.Audio.setEnabled(!RW.Audio.isEnabled());
      render();
      RW.Audio.ding();
    };
    render();
  }

  // ===== Dialogs =====

  function openAbout() {
    if (RW.WM.get('about-me')) { RW.WM.bringToFront('about-me'); return; }
    const html = '\n<div class="notepad-doc">\n' +
      '  <pre class="np-pre">RICK WAYNE - DIRECTOR.SYS\n' +
      '==========================\n' +
      '</pre>\n' +
      '  <pre class="np-pre">Rick Wayne\n' +
      'Director. Creative Director. Writer.\n' +
      'Brooklyn, NY\n' +
      '</pre>\n' +
      '  <pre class="np-pre">I was born in 1989. That\'s why you\'re seeing this hidden Windows theme. My career started here, on a beige Windows 95 machine, making home videos in Windows Movie Maker in 2003. I never stopped. I hone the craft every day.</pre>\n\n' +
      '  <pre class="np-pre">FIRST SHOOT\n' +
      '-----------</pre>\n' +
      '  <div class="first-shoot-photo">\n' +
      '    <div class="paint-chrome">\n' +
      '      <div class="paint-titlebar">\n' +
      '        <span class="paint-title">Untitled.bmp - Paint</span>\n' +
      '        <span class="paint-ctrls"><button>_</button><button>[]</button><button>X</button></span>\n' +
      '      </div>\n' +
      '      <div class="paint-menubar">File  Edit  View  Image  Options  Help</div>\n' +
      '      <div class="paint-canvas">\n' +
      '        <div class="scanlines"></div>\n' +
      '        <div class="vhs-noise"></div>\n' +
      '        <img class="first-shoot-img" src="images/1%20(80).JPG" alt="Rick\'s first shoot">\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <p class="np-pre photo-caption">This is the first time I ever picked up a camera. Me and my friends made a movie called The Matrix. We didn\'t know what we were doing. We didn\'t care. I haven\'t stopped since.</p>\n' +
      '  </div>\n\n' +
      '  <pre class="np-pre">I BELIEVE\n' +
      '---------\n' +
      'Great commercial work is great human work first. Strategy is a craft. Directing is a craft. Casting is a craft. Editing is a craft. The brief is a starting point, not a ceiling. The best films feel inevitable. They never are.</pre>\n\n' +
      '  <pre class="np-pre">Contact: rick_wayne@me.com\n' +
      'Reel:    https://rickwayne.cc\n' +
      'IG:      https://instagram.com/rick_wayne</pre>\n\n' +
      '  <pre class="np-pre">(c) 1993-2026 Rick Wayne. All rights reserved.</pre>\n' +
      '</div>\n';
    RW.WM.open({
      id: 'about-me',
      title: 'About Me.txt - Notepad',
      icon: ICONS.text,
      width: 620, height: 540,
      contentHTML: html
    });
  }

  function openContact() {
    if (RW.WM.get('contact-eml')) { RW.WM.bringToFront('contact-eml'); return; }
    const bio = RW.bio;
    const html =
      '<div class="dialog-body">' +
      '<p><b>New Message</b></p>' +
      '<p>To: <a href="mailto:' + bio.email + '">' + bio.email + '</a></p>' +
      '<p>Subject: Project inquiry for Rick Wayne</p>' +
      '<hr>' +
      '<p>Hi Rick,</p>' +
      '<p>I would like to talk about a project.</p>' +
      '<p>Best,</p>' +
      '</div>' +
      '<div class="dialog-buttons">' +
      '<button onclick="window.location.href=\'mailto:' + bio.email + '\'">Send</button>' +
      '<button data-close="contact-eml">Close</button>' +
      '</div>';
    const w = RW.WM.open({
      id: 'contact-eml',
      title: 'Contact.eml - Inbox',
      icon: ICONS.mail,
      width: 460, height: 320,
      contentHTML: html
    });
    w.body.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => RW.WM.close(b.dataset.close));
    });
  }

  function openMyComputer() {
    if (RW.WM.get('my-computer')) { RW.WM.bringToFront('my-computer'); return; }
    const drives = [
      { label: 'C:\\ Director', icon: hardDriveIcon(), action: () => RW.Explorer.openWork() },
      { label: 'A:\\ Treatments', icon: floppyIcon(),  action: () => alert('Drive A is not ready.\n\nProbably for the best. The first draft never is.') },
      { label: 'D:\\ Dailies',   icon: cdIcon(),       action: () => alert('Please insert a disc.\n\nNot that kind.') }
    ];
    let html = '<div class="my-computer-grid">';
    drives.forEach((d, i) => {
      html += '<div class="mc-drive" data-idx="' + i + '"><div class="icon-img">' + d.icon + '</div><div class="label">' + RW.WM.escapeHtml(d.label) + '</div></div>';
    });
    html += '</div>';
    const w = RW.WM.open({
      id: 'my-computer',
      title: 'My Computer',
      icon: ICONS.computer,
      width: 420, height: 260,
      contentHTML: html
    });
    w.body.querySelectorAll('.mc-drive').forEach((el, i) => {
      el.addEventListener('click', () => {
        w.body.querySelectorAll('.mc-drive').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
      });
      el.addEventListener('dblclick', () => drives[i].action());
    });
  }

  function openRecycle() {
    if (RW.WM.get('recycle-bin')) { RW.WM.bringToFront('recycle-bin'); return; }
    const html =
      '<div class="dialog-body">' +
      '<p><b>Recycle Bin - 1 item</b></p>' +
      '<p style="margin:8px 0">Found: <b>doubt.tmp</b></p>' +
      '<p style="font-size:11px;color:#444">Last modified: every project. Original location: between takes.</p>' +
      '<p style="margin-top:12px">Empty Recycle Bin?</p>' +
      '</div>' +
      '<div class="dialog-buttons">' +
      '<button data-yes>Yes, empty it</button>' +
      '<button data-close>No, keep doubting</button>' +
      '</div>';
    const w = RW.WM.open({
      id: 'recycle-bin', title: 'Recycle Bin', icon: ICONS.recycle,
      width: 360, height: 220, contentHTML: html
    });
    w.body.querySelector('[data-yes]').addEventListener('click', () => {
      w.body.innerHTML = '<div class="dialog-body"><p>Doubt deleted. Confidence restored.</p><p style="font-size:11px;color:#444">Until tomorrow.</p></div><div class="dialog-buttons"><button data-close>OK</button></div>';
      w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('recycle-bin'));
      if (RW.Audio) RW.Audio.ding();
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('recycle-bin'));
  }

  function hardDriveIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="8" width="24" height="16" fill="#c0c0c0" stroke="#000"/><rect x="4" y="8" width="24" height="4" fill="#808080" stroke="#000"/><circle cx="24" cy="10" r="1" fill="#0f0"/></svg>';
  }
  function floppyIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="3" width="24" height="26" fill="#000080" stroke="#000"/><rect x="9" y="3" width="14" height="11" fill="#c0c0c0" stroke="#000"/><rect x="11" y="3" width="2" height="9" fill="#000"/><rect x="8" y="17" width="16" height="11" fill="#c0c0c0" stroke="#000"/><line x1="10" y1="20" x2="22" y2="20" stroke="#000"/><line x1="10" y1="23" x2="22" y2="23" stroke="#000"/></svg>';
  }
  function cdIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#dfdfdf" stroke="#000"/><circle cx="16" cy="16" r="4" fill="#fff" stroke="#000"/><circle cx="16" cy="16" r="1" fill="#000"/></svg>';
  }

  // ===== Display properties =====
  Desktop.openDisplayProperties = function () {
    if (RW.WM.get('display-props')) { RW.WM.bringToFront('display-props'); return; }
    const catalog = (RW.Wallpaper && RW.Wallpaper.catalog) || [];
    let html =
      '<div class="display-prefs">' +
        '<p style="margin:0 0 6px"><b>Wallpaper</b></p>' +
        '<div class="preview" id="dp-preview"><div class="mini-taskbar"></div></div>' +
        '<div class="dp-list" id="dp-list"></div>' +
        '<div style="font-size:11px">Pick a Windows 95 wallpaper.</div>' +
      '</div>' +
      '<div class="dialog-buttons">' +
        '<button data-close>OK</button>' +
        '<button data-close>Cancel</button>' +
      '</div>';
    const w = RW.WM.open({
      id: 'display-props',
      title: 'Display Properties',
      icon: ICONS.computer,
      width: 360, height: 360,
      resizable: false,
      contentHTML: html
    });
    const list = w.body.querySelector('#dp-list');
    const preview = w.body.querySelector('#dp-preview');
    function previewItem(name) {
      const colorVal = RW.Wallpaper.previewColor(name);
      const url = RW.Wallpaper.previewURL(name);
      if (colorVal) {
        preview.style.background = colorVal;
      } else if (url) {
        preview.style.background = 'center / cover no-repeat url("' + url + '")';
      }
    }
    catalog.forEach(item => {
      const row = document.createElement('div');
      row.className = 'dp-row';
      row.dataset.name = item.name;
      if (RW.Wallpaper.current === item.name) row.classList.add('selected');
      row.textContent = item.name;
      row.addEventListener('click', () => {
        list.querySelectorAll('.dp-row').forEach(x => x.classList.remove('selected'));
        row.classList.add('selected');
        previewItem(item.name);
        RW.Wallpaper.apply(item.name);
        if (RW.Audio) RW.Audio.click();
      });
      list.appendChild(row);
    });
    if (RW.Wallpaper.current) previewItem(RW.Wallpaper.current);
    w.body.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => RW.WM.close('display-props'));
    });
  };

  // Help dialog
  Desktop.openHelp = function () {
    if (RW.WM.get('help')) { RW.WM.bringToFront('help'); return; }
    const html = '<div class="dialog-body">' +
      '<p><b>Windows 95 Help</b></p>' +
      '<p>This is a portfolio site dressed as Windows 95.</p>' +
      '<p>Double-click WORK to browse reels. Double-click PRESS for press.</p>' +
      '<p>Start menu does what you would expect, mostly.</p>' +
      '<p>Tip: try the Run command. Type "rick".</p>' +
      '</div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      id: 'help', title: 'Windows 95 Help', icon: ICONS.text,
      width: 380, height: 240, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('help'));
  };

  // Run dialog
  Desktop.openRun = function () {
    if (RW.WM.get('run')) { RW.WM.bringToFront('run'); return; }
    const html = '<div class="run-dialog dialog-body">' +
      '<p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>' +
      '<div class="row"><label>Open:</label><input type="text" id="run-input" autofocus /></div>' +
      '</div>' +
      '<div class="dialog-buttons">' +
      '<button data-ok>OK</button><button data-close>Cancel</button>' +
      '</div>';
    const w = RW.WM.open({
      id: 'run', title: 'Run', icon: ICONS.exe,
      width: 360, height: 200, resizable: false,
      contentHTML: html
    });
    const input = w.body.querySelector('#run-input');
    setTimeout(() => input.focus(), 50);
    function go() {
      const val = (input.value || '').trim().toLowerCase();
      if (val === 'rick' || val === 'rick.exe') {
        RW.WM.close('run');
        RW.Easter.bsod();
        return;
      }
      // Not found
      RW.WM.close('run');
      const eHtml = '<div class="dialog-body"><p>Cannot find the file \'' + RW.WM.escapeHtml(input.value) + '\' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.</p></div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const ew = RW.WM.open({
        title: 'Run', icon: ICONS.exe, width: 420, height: 180, contentHTML: eHtml, resizable: false
      });
      ew.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(ew.id));
      if (RW.Audio) RW.Audio.error();
    }
    w.body.querySelector('[data-ok]').addEventListener('click', go);
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('run'));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  };

  // Shutdown dialog
  Desktop.openShutdown = function () {
    if (RW.WM.get('shutdown')) { RW.WM.bringToFront('shutdown'); return; }
    const html = '<div class="shutdown-dialog dialog-body">' +
      '<p><b>Are you sure you want to:</b></p>' +
      '<label><input type="radio" name="sd" value="shut" checked> Shut down the computer?</label>' +
      '<label><input type="radio" name="sd" value="restart"> Restart the computer?</label>' +
      '<label><input type="radio" name="sd" value="logon"> Close all programs and log on as a different user?</label>' +
      '</div>' +
      '<div class="dialog-buttons">' +
      '<button data-ok>Yes</button><button data-close>No</button><button data-help>Help</button>' +
      '</div>';
    const w = RW.WM.open({
      id: 'shutdown', title: 'Shut Down Windows', icon: ICONS.computer,
      width: 360, height: 240, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-ok]').addEventListener('click', () => {
      RW.WM.close('shutdown');
      doShutdown();
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('shutdown'));
    w.body.querySelector('[data-help]').addEventListener('click', () => Desktop.openHelp());
  };

  function doShutdown() {
    if (RW.Audio) RW.Audio.shutdown();
    const ss = document.getElementById('shutdown-screen');
    ss.hidden = false;
    ss.addEventListener('click', () => {
      ss.hidden = true;
      try { sessionStorage.removeItem('rw93_booted_v2'); } catch (e) {}
      window.location.reload();
    }, { once: true });
  }

  // Start menu actions hooked from startmenu.js
  Desktop.openWork = () => RW.Explorer.openWork();
  Desktop.openPress = () => RW.Explorer.openPress();
  Desktop.openMinesweeper = () => RW.Minesweeper.open();
  Desktop.openAbout = openAbout;
  Desktop.openContact = openContact;
  Desktop.openMyComputer = openMyComputer;

  // Initialize when desktop is ready
  document.addEventListener('rw:desktop-ready', () => {
    buildIcons();
    startClock();
    setupSoundToggle();
  });
})();
