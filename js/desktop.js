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
    network: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="14" height="10" fill="#c0c0c0" stroke="#000"/><rect x="15" y="16" width="14" height="10" fill="#c0c0c0" stroke="#000"/><line x1="10" y1="16" x2="22" y2="16" stroke="#000"/></svg>',
    movie: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="22" height="20" fill="#404040" stroke="#000"/><rect x="3" y="6" width="22" height="3" fill="#000"/><rect x="3" y="23" width="22" height="3" fill="#000"/><circle cx="6" cy="7.5" r="0.7" fill="#fff"/><circle cx="10" cy="7.5" r="0.7" fill="#fff"/><circle cx="14" cy="7.5" r="0.7" fill="#fff"/><circle cx="18" cy="7.5" r="0.7" fill="#fff"/><circle cx="22" cy="7.5" r="0.7" fill="#fff"/><circle cx="6" cy="24.5" r="0.7" fill="#fff"/><circle cx="10" cy="24.5" r="0.7" fill="#fff"/><circle cx="14" cy="24.5" r="0.7" fill="#fff"/><circle cx="18" cy="24.5" r="0.7" fill="#fff"/><circle cx="22" cy="24.5" r="0.7" fill="#fff"/><rect x="6" y="11" width="16" height="10" fill="#a6caf0" stroke="#000"/><polygon points="11,13 11,19 18,16" fill="#fff"/><rect x="22" y="10" width="8" height="12" fill="#c0c0c0" stroke="#000"/><circle cx="26" cy="14" r="2" fill="#808080" stroke="#000"/><circle cx="26" cy="18" r="2" fill="#808080" stroke="#000"/></svg>',
    ie: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#1976d2" stroke="#000"/><path d="M6 14 Q16 6 26 14 Q22 12 16 12 Q10 12 6 14 Z" fill="#fff" stroke="#000"/><text x="16" y="22" font-family="serif" font-weight="bold" font-size="13" text-anchor="middle" fill="#fff">e</text><ellipse cx="16" cy="20" rx="11" ry="3" fill="none" stroke="#ffcc00" stroke-width="1.5" transform="rotate(-20 16 20)"/></svg>',
    music: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="26" height="20" fill="#c0c0c0" stroke="#000"/><rect x="3" y="6" width="26" height="3" fill="#000080"/><rect x="5" y="11" width="22" height="9" fill="#000"/><circle cx="10" cy="15.5" r="1.5" fill="#0f0"/><circle cx="22" cy="15.5" r="1.5" fill="#0f0"/><path d="M11 22 L11 16 L14 16 L14 21" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="10" cy="22" r="1.5" fill="#000"/></svg>'
  };

  // v5: cassette tape SVG for Mixtape.exe.
  const mixtapeIconSVG =
    '<svg viewBox="0 0 32 32" width="32" height="32">' +
      '<rect x="2" y="6"  width="28" height="20" fill="#c0c0c0" stroke="#000"/>' +
      '<rect x="4" y="9"  width="24" height="12" fill="#101820" stroke="#000"/>' +
      '<circle cx="11" cy="15" r="2.6" fill="#c0c0c0" stroke="#000"/>' +
      '<circle cx="21" cy="15" r="2.6" fill="#c0c0c0" stroke="#000"/>' +
      '<rect x="3" y="22" width="26" height="3" fill="#808080" stroke="#000"/>' +
      '<rect x="6" y="10" width="20" height="2" fill="#ff8c00"/>' +
      '<text x="16" y="20" font-family="monospace" font-size="4.5" text-anchor="middle" fill="#fff">MIXTAPE</text>' +
    '</svg>';

  // v5: IE logo with white shortcut-arrow overlay for My Space.url. No image asset.
  const mySpaceShortcutIconSVG =
    '<svg viewBox="0 0 32 32" width="32" height="32">' +
      '<circle cx="16" cy="16" r="12" fill="#1976d2" stroke="#000"/>' +
      '<ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#fff" stroke-width="0.8"/>' +
      '<ellipse cx="16" cy="16" rx="4.5" ry="12" fill="none" stroke="#fff" stroke-width="0.8"/>' +
      '<text x="16" y="21" font-family="serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#ffcc00">e</text>' +
      /* shortcut arrow corner */
      '<rect x="2" y="22" width="10" height="10" fill="#fff" stroke="#000"/>' +
      '<polygon points="4,24 9,24 9,21 11,25 9,29 9,26 4,26" fill="#000"/>' +
    '</svg>';

  // Desktop icons config - left column, authentic Win95 order
  const desktopIcons = [
    { id: 'mycomp',   label: 'My Computer',     icon: ICONS.computer, action: () => openMyComputer() },
    { id: 'work',     label: 'WORK',            icon: ICONS.folder,   action: () => RW.Explorer.openWork() },
    { id: 'press',    label: 'PRESS',           icon: ICONS.folder,   action: () => RW.Explorer.openPress() },
    { id: 'about',    label: 'ABOUT ME.txt',    icon: ICONS.text,     action: () => openAbout() },
    { id: 'contact',  label: 'CONTACT.eml',     icon: ICONS.mail,     action: () => openContact() },
    { id: 'mine',     label: 'MINESWEEPER.exe', icon: ICONS.mine,     action: () => RW.Minesweeper.open() },
    { id: 'movie',    label: 'Movie Maker.exe', icon: ICONS.movie,    action: () => RW.MovieMaker.open() },
    /* v5: My Space shortcut sits below Movie Maker per spec. CSS-built IE icon
       plus the white shortcut-arrow corner glyph (no external image). */
    { id: 'myspace',  label: 'My Space.url',    icon: mySpaceShortcutIconSVG, action: () => RW.MySpace && RW.MySpace.open() },
    /* v5: Mixtape.exe with cassette icon.
       v8: Music.exe retired - Mixtape is the only music player. */
    { id: 'mixtape',  label: 'Mixtape.exe',     icon: mixtapeIconSVG,         action: () => RW.Mixtape && RW.Mixtape.open() },
    { id: 'ie',       label: 'Internet Explorer.exe', icon: ICONS.ie, action: () => RW.IE && RW.IE.open() },
    { id: 'recycle',  label: 'Recycle Bin',     icon: ICONS.recycle,  action: () => openRecycle() }
  ];

  function buildIcons() {
    const ul = document.getElementById('desktop-icons');
    ul.innerHTML = '';
    const touch = !!window.RW_TOUCH;
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
        // v7 touch: single-tap to open. On a phone, double-tap is a
        // browser zoom gesture and feels wrong for an icon.
        if (touch) {
          if (RW.Audio) RW.Audio.dblclick();
          cfg.action();
        }
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
      '  <pre class="np-pre">P.S. - open Mixtape.exe. I made you something.</pre>\n\n' +
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
      { id: 'a', label: '(A:) 3.5" Floppy',     icon: floppyIcon(),    action: () => openDriveA() },
      { id: 'c', label: '(C:) Hard Drive',      icon: hardDriveIcon(), action: () => openDriveC() },
      { id: 'd', label: '(D:) CD-ROM Drive',    icon: cdIcon(),        action: () => openDriveD() },
      { id: 'cp', label: 'Control Panel',       icon: ICONS.computer,  action: () => Desktop.openControlPanel() },
      { id: 'rb', label: 'Recycle Bin',         icon: ICONS.recycle,   action: () => openRecycle() }
    ];
    let html = '<div class="my-computer-grid">';
    drives.forEach((d, i) => {
      html += '<div class="mc-drive" data-idx="' + i + '" data-id="' + d.id + '"><div class="icon-img">' + d.icon + '</div><div class="label">' + RW.WM.escapeHtml(d.label) + '</div></div>';
    });
    html += '</div>';
    const w = RW.WM.open({
      id: 'my-computer',
      title: 'My Computer',
      icon: ICONS.computer,
      width: 480, height: 300,
      contentHTML: html
    });
    w.body.querySelectorAll('.mc-drive').forEach((el, i) => {
      el.addEventListener('click', () => {
        w.body.querySelectorAll('.mc-drive').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        // v7 touch: single-tap opens. Same authentic Win95 chrome, just
        // friendlier for thumbs.
        if (window.RW_TOUCH) drives[i].action();
      });
      el.addEventListener('dblclick', () => drives[i].action());
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (drives[i].id === 'd') {
          RW.ContextMenu.show(e.clientX, e.clientY, [
            { label: 'Open', action: () => drives[i].action() },
            { sep: true },
            { label: 'Eject', action: () => {
              const html2 = '<div class="dialog-body"><p>Cannot eject. Drive is the soul of the operation.</p></div>' +
                '<div class="dialog-buttons"><button data-close>OK</button></div>';
              const aw = RW.WM.open({
                title: 'Cannot Eject D:', icon: cdIcon(),
                width: 360, height: 160, resizable: false, contentHTML: html2
              });
              aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
              if (RW.Audio) RW.Audio.error();
            }}
          ]);
        }
      });
    });
  }

  // ===== Drive A =====
  function openDriveA() {
    const html =
      '<div class="dialog-body mc-drive-a-error">' +
        '<div class="critical-icon"><svg viewBox="0 0 32 32" width="32" height="32">' +
          '<circle cx="16" cy="16" r="13" fill="#c8102e" stroke="#000"/>' +
          '<path d="M9 9 L23 23 M23 9 L9 23" stroke="#fff" stroke-width="3" fill="none"/>' +
        '</svg></div>' +
        '<div class="critical-msg"><p>There is no disk in drive A:.</p><p>Please insert a disk and try again.</p></div>' +
      '</div>' +
      '<div class="dialog-buttons">' +
        '<button data-act="cancel">Cancel</button>' +
        '<button data-act="retry">Retry</button>' +
        '<button data-act="continue">Continue</button>' +
      '</div>';
    const w = RW.WM.open({
      title: 'Drive A', icon: floppyIcon(),
      width: 400, height: 200, resizable: false, contentHTML: html
    });
    if (RW.Audio) RW.Audio.error();
    w.body.querySelectorAll('button[data-act]').forEach(b => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        if (act === 'continue') {
          RW.WM.close(w.id);
          const html2 = '<div class="dialog-body"><p>Continued.</p></div>' +
            '<div class="dialog-buttons"><button data-close>OK</button></div>';
          const aw = RW.WM.open({
            title: 'Drive A', icon: floppyIcon(),
            width: 280, height: 140, resizable: false, contentHTML: html2
          });
          aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
        } else {
          RW.WM.close(w.id);
        }
      });
    });
  }

  // ===== Drive C =====
  function openDriveC() {
    if (RW.WM.get('drive-c')) { RW.WM.bringToFront('drive-c'); return; }
    const items = [
      { label: 'Program Files', icon: ICONS.folder, action: () => openProgramFiles() },
      { label: 'Windows',       icon: ICONS.folder, action: () => openWindowsFolder() },
      { label: 'My Documents',  icon: ICONS.folder, action: () => openMyDocuments() },
      { label: 'autoexec.bat',  icon: ICONS.text,   action: () => openSystemText('autoexec.bat', AUTOEXEC_BAT) }
    ];
    openFolderWindow({ id: 'drive-c', title: 'C:\\', path: 'C:\\', items: items });
  }

  function openProgramFiles() {
    if (RW.WM.get('pf')) { RW.WM.bringToFront('pf'); return; }
    // v8: Mixtape.exe replaces Music.exe in Program Files.
    const items = [
      { label: 'Notepad',               icon: ICONS.text,  action: () => openAbout() },
      { label: 'Calculator',            icon: ICONS.exe,   action: () => RW.Calculator.open() },
      { label: 'Paint',                 icon: ICONS.exe,   action: () => RW.Paint.open() },
      { label: 'Solitaire',             icon: ICONS.exe,   action: () => RW.Solitaire.open() },
      { label: 'Minesweeper',           icon: ICONS.mine,  action: () => RW.Minesweeper.open() },
      { label: 'Movie Maker',           icon: ICONS.movie, action: () => RW.MovieMaker.open() },
      { label: 'Mixtape',               icon: ICONS.exe,   action: () => RW.Mixtape && RW.Mixtape.open() },
      { label: 'Windows Media Player',  icon: ICONS.video, action: () => RW.Explorer.openWork() }
    ];
    openFolderWindow({ id: 'pf', title: 'Program Files', path: 'C:\\Program Files', items: items });
  }

  function openWindowsFolder() {
    if (RW.WM.get('windows-folder')) { RW.WM.bringToFront('windows-folder'); return; }
    const items = [
      { label: 'system.ini', icon: ICONS.text, action: () => openSystemText('system.ini', SACRED_BYTES) },
      { label: 'config.sys', icon: ICONS.text, action: () => openSystemText('config.sys', SACRED_BYTES) }
    ];
    openFolderWindow({ id: 'windows-folder', title: 'Windows', path: 'C:\\Windows', items: items });
  }

  function openMyDocuments() {
    if (RW.WM.get('mydocs')) { RW.WM.bringToFront('mydocs'); return; }
    const items = [
      { label: 'diary.txt',                icon: ICONS.text,  action: () => openSystemText('diary.txt', DIARY_TXT) },
      { label: 'first-movie.mp4',          icon: ICONS.video, action: () => openFirstMovie() },
      { label: 'letter-to-younger-me.txt', icon: ICONS.text,  action: () => openSystemText('letter-to-younger-me.txt', LETTER_TXT) },
      { label: 'why-i-direct.txt',         icon: ICONS.text,  action: () => openSystemText('why-i-direct.txt', WHY_TXT) }
    ];
    openFolderWindow({ id: 'mydocs', title: 'My Documents', path: 'C:\\My Documents', items: items });
  }

  function openFolderWindow(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'explorer-body';
    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item"><u>F</u>ile</span>' +
        '<span class="mb-item"><u>E</u>dit</span>' +
        '<span class="mb-item"><u>V</u>iew</span>' +
        '<span class="mb-item"><u>H</u>elp</span>' +
      '</div>' +
      '<div class="address-bar">' +
        '<label>Address:</label>' +
        '<div class="address-input"><span class="address-path">' + RW.WM.escapeHtml(opts.path) + '</span></div>' +
      '</div>' +
      '<div class="explorer-list"></div>' +
      '<div class="status-bar">' +
        '<div class="sb-cell">' + opts.items.length + ' object(s)</div>' +
        '<div class="sb-cell" style="margin-left:auto">My Computer</div>' +
      '</div>';
    const w = RW.WM.open({
      id: opts.id, title: opts.title, icon: ICONS.folder,
      width: 520, height: 360, contentNode: wrap
    });
    w.body.style.padding = '0';
    const list = wrap.querySelector('.explorer-list');
    opts.items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'explorer-item';
      el.innerHTML = '<div class="icon-img">' + it.icon + '</div><div class="label">' + RW.WM.escapeHtml(it.label) + '</div>';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        list.querySelectorAll('.explorer-item.selected').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        if (window.RW_TOUCH && it.action) {
          if (RW.Audio) RW.Audio.dblclick();
          it.action();
        }
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (RW.Audio) RW.Audio.dblclick();
        if (it.action) it.action();
      });
      list.appendChild(el);
    });
  }

  function openSystemText(title, content) {
    const id = 'np-' + title.replace(/[^a-z0-9]/gi, '');
    if (RW.WM.get(id)) { RW.WM.bringToFront(id); return; }
    const html = '<div class="notepad-body" style="height:100%"><textarea readonly>' +
      RW.WM.escapeHtml(content) + '</textarea></div>';
    RW.WM.open({
      id: id,
      title: title + ' - Notepad',
      icon: ICONS.text,
      width: 520, height: 420,
      contentHTML: html
    });
    RW.StartMenu && RW.StartMenu.touchDocument(title);
  }

  const SACRED_BYTES = 'These bytes are sacred. Do not edit. - Rick';

  const AUTOEXEC_BAT =
'@ECHO OFF\n' +
'REM Loading inspiration drivers...\n' +
'REM Mounting curiosity at C:\\HEART\n' +
'REM Setting PATH=C:\\KIDS_WHO_NEVER_GREW_UP\n' +
'PROMPT $P$G_BUT_KEEP_GOING\n' +
'SET WAKE_UP_TIME=BEFORE_THE_SUN\n' +
'SET BEDTIME=AFTER_THE_EDIT\n' +
'ECHO Ready, Rick.\n';

  const DIARY_TXT =
'august 14, 2003\n' +
'mom let me have the camera again. dad said be careful with it.\n' +
'me and the guys are gonna shoot the matrix today behind the\n' +
'shed. mike is neo. i\'m directing. i don\'t know what directing\n' +
'means yet but i think it means saying things like ACTION.\n' +
'\n' +
'august 16, 2003\n' +
'we shot for six hours. nothing worked. battery died twice. mike\n' +
'fell into a bush. it was the best day of my whole life.\n' +
'\n' +
'august 23, 2003\n' +
'finished the edit on the family computer. windows movie maker\n' +
'crashed twice. when it played back i cried a little. i don\'t\n' +
'think i told anyone.\n' +
'\n' +
'september 1, 2003\n' +
'school started. nobody else seems to think about this stuff\n' +
'all day. i guess that\'s how i know.\n' +
'\n' +
'january, today\n' +
'i think i made it. thanks for reading.\n';

  const LETTER_TXT =
'hey kid.\n' +
'\n' +
'i know the basement is cold and the cables look like spaghetti\n' +
'and the camera battery is dying. it\'s fine. keep going.\n' +
'\n' +
'the people who hired you the longest are the ones who saw it\n' +
'in this version of you. the version sitting on the basement\n' +
'floor at 1am trying to make the bush look like the matrix.\n' +
'\n' +
'you\'ll get the gear. you\'ll get the team. you\'ll get the\n' +
'brands. none of it is the thing. the thing is the feeling\n' +
'you have right now when the edit finally cuts together.\n' +
'keep chasing that feeling. that feeling is the whole job.\n' +
'\n' +
'and tell your mom thanks for letting you wreck the basement\n' +
'with cables.\n' +
'\n' +
'love,\n' +
'you\n';

  const WHY_TXT =
'I direct because a great commercial is the most generous\n' +
'thing the medium can do. Thirty seconds, a few million\n' +
'strangers, one shared feeling. That\'s the deal. I make the\n' +
'deal good.\n';

  function openFirstMovie() {
    const ID2 = 'first-movie';
    if (RW.WM.get(ID2)) { RW.WM.bringToFront(ID2); return; }
    const wrap = document.createElement('div');
    wrap.className = 'fm-body';
    wrap.innerHTML =
      '<div class="fm-titlebar-extra">first-movie.mp4 - Windows Media Player</div>' +
      '<div class="fm-screen"><div class="fm-line" data-fm-line></div></div>' +
      '<div class="fm-controls">' +
        '<button class="fm-btn" data-fm-play>Play</button>' +
        '<button class="fm-btn" data-fm-stop>Stop</button>' +
        '<div class="fm-time" data-fm-time>0:00</div>' +
      '</div>' +
      '<div class="fm-info">Rick\'s first short film, 2003. Lost to time. This .mp4 was reconstructed from memory. If you have a copy, mail it to rick_wayne@me.com.</div>';
    const w = RW.WM.open({
      id: ID2,
      title: 'Windows Media Player - first-movie.mp4',
      icon: ICONS.video,
      width: 540, height: 460,
      contentNode: wrap
    });
    w.body.style.padding = '0';

    const lineEl = wrap.querySelector('[data-fm-line]');
    const timeEl = wrap.querySelector('[data-fm-time]');
    const lines = [
      'RICK\'S FIRST SHORT FILM (2003)',
      'RECONSTRUCTED FROM MEMORY',
      'DIRECTED BY A KID',
      'STARRING HIS FRIENDS',
      'MADE IN WINDOWS MOVIE MAKER',
      'FIN'
    ];
    let timers = [];
    let startTs = 0;
    let timeId = null;

    function fmtT(ms) {
      const s = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(s / 60);
      return m + ':' + String(s % 60).padStart(2, '0');
    }
    function stop() {
      timers.forEach(t => clearTimeout(t));
      timers = [];
      if (timeId) { clearInterval(timeId); timeId = null; }
      lineEl.textContent = '';
      timeEl.textContent = '0:00';
    }
    function play() {
      stop();
      startTs = Date.now();
      timeId = setInterval(() => { timeEl.textContent = fmtT(Date.now() - startTs); }, 200);
      lines.forEach((ln, i) => {
        const showAt = i * 1500;
        const hideAt = showAt + 1200;
        timers.push(setTimeout(() => { lineEl.textContent = ln; lineEl.classList.add('show'); }, showAt));
        timers.push(setTimeout(() => { lineEl.classList.remove('show'); }, hideAt));
      });
      // end after last line
      timers.push(setTimeout(() => {
        if (timeId) { clearInterval(timeId); timeId = null; }
      }, lines.length * 1500 + 200));
    }
    wrap.querySelector('[data-fm-play]').addEventListener('click', play);
    wrap.querySelector('[data-fm-stop]').addEventListener('click', stop);
    const prevClose = w.onClose;
    w.onClose = function () { stop(); if (prevClose) prevClose(); };
    play();
    RW.StartMenu && RW.StartMenu.touchDocument('first-movie.mp4');
  }

  // ===== Drive D =====
  function openDriveD() {
    if (RW.WM.get('drive-d')) { RW.WM.bringToFront('drive-d'); return; }
    const items = [
      { label: 'RICK_WAYNE_REELS_1995.ISO', icon: cdIcon(), action: () => simpleInfo('Disc Info', 'Disc inserted: RICK_WAYNE_REELS_1995.ISO. Open highlights.mp4 to play the featured reel.') },
      { label: 'highlights.mp4', icon: ICONS.video, action: () => {
        const featured = (RW.projects || []).find(p => /sharpie/i.test(p.id) && /roty/i.test(p.id))
          || (RW.projects || [])[0];
        if (featured && RW.WMP) RW.WMP.openProject(featured.id);
      }}
    ];
    openFolderWindow({ id: 'drive-d', title: 'D:\\', path: 'D:\\', items: items });
  }

  function simpleInfo(title, body) {
    const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(body) + '</p></div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const aw = RW.WM.open({
      title: title, icon: ICONS.computer,
      width: 380, height: 180, resizable: false, contentHTML: html
    });
    aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
  }

  // ===== Control Panel =====
  Desktop.openControlPanel = function () {
    if (RW.WM.get('control-panel')) { RW.WM.bringToFront('control-panel'); return; }
    const items = [
      { label: 'Display',             icon: ICONS.computer, action: () => Desktop.openDisplayProperties() },
      { label: 'Sounds',              icon: soundCpIcon(),  action: () => openSoundsCP() },
      { label: 'Date/Time',           icon: clockCpIcon(),  action: () => openDateTimeCP() },
      { label: 'Mouse',               icon: mouseCpIcon(),  action: () => openMouseCP() },
      { label: 'Add/Remove Programs', icon: arpCpIcon(),    action: () => openAddRemoveCP() }
    ];
    const wrap = document.createElement('div');
    wrap.className = 'explorer-body';
    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item"><u>F</u>ile</span>' +
        '<span class="mb-item"><u>E</u>dit</span>' +
        '<span class="mb-item"><u>V</u>iew</span>' +
        '<span class="mb-item"><u>H</u>elp</span>' +
      '</div>' +
      '<div class="address-bar"><label>Address:</label><div class="address-input"><span class="address-path">Control Panel</span></div></div>' +
      '<div class="explorer-list"></div>' +
      '<div class="status-bar"><div class="sb-cell">' + items.length + ' object(s)</div><div class="sb-cell" style="margin-left:auto">Configures system settings</div></div>';
    const w = RW.WM.open({
      id: 'control-panel', title: 'Control Panel', icon: ICONS.computer,
      width: 520, height: 360, contentNode: wrap
    });
    w.body.style.padding = '0';
    const list = wrap.querySelector('.explorer-list');
    items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'explorer-item';
      el.innerHTML = '<div class="icon-img">' + it.icon + '</div><div class="label">' + RW.WM.escapeHtml(it.label) + '</div>';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        list.querySelectorAll('.explorer-item.selected').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        if (window.RW_TOUCH) { if (RW.Audio) RW.Audio.dblclick(); it.action(); }
      });
      el.addEventListener('dblclick', () => { if (RW.Audio) RW.Audio.dblclick(); it.action(); });
      list.appendChild(el);
    });
  };

  function soundCpIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="26" height="20" fill="#c0c0c0" stroke="#000"/><rect x="3" y="6" width="26" height="3" fill="#000080"/><path d="M8 18 h4 l5 -4 v12 l-5 -4 h-4z" fill="#fff" stroke="#000"/><path d="M22 15 c2 2 2 7 0 9" stroke="#000" fill="none"/></svg>';
  }
  function clockCpIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#fff" stroke="#000"/><line x1="16" y1="16" x2="16" y2="8" stroke="#000" stroke-width="2"/><line x1="16" y1="16" x2="22" y2="16" stroke="#000" stroke-width="2"/></svg>';
  }
  function mouseCpIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="9" y="5" width="14" height="22" rx="6" fill="#c0c0c0" stroke="#000"/><line x1="16" y1="5" x2="16" y2="14" stroke="#000"/><rect x="14.5" y="8" width="3" height="5" fill="#808080" stroke="#000"/></svg>';
  }
  function arpCpIcon() {
    return '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="4" y="6" width="24" height="3" fill="#000080"/><line x1="8" y1="14" x2="24" y2="14" stroke="#000"/><line x1="8" y1="18" x2="24" y2="18" stroke="#000"/><line x1="8" y1="22" x2="20" y2="22" stroke="#000"/></svg>';
  }

  function openSoundsCP() {
    const enabled = RW.Audio.isEnabled();
    const scheme = sessionStorage.getItem('rw93_sound_scheme') || 'Default';
    const html =
      '<div class="dialog-body">' +
        '<p><b>Sounds Properties</b></p>' +
        '<p><label><input type="checkbox" data-sound-enable ' + (enabled ? 'checked' : '') + '> Enable Windows sounds</label></p>' +
        '<p style="margin-top:10px"><b>Scheme:</b> <select data-scheme>' +
          ['Default','Musica','Robotz','Utopia'].map(s => '<option ' + (s === scheme ? 'selected' : '') + '>' + s + '</option>').join('') +
        '</select></p>' +
        '<p style="font-size:11px;color:#444">Schemes change the timbre of system dings.</p>' +
      '</div>' +
      '<div class="dialog-buttons"><button data-test>Test ding</button><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Sounds Properties', icon: soundCpIcon(),
      width: 380, height: 260, resizable: false, contentHTML: html
    });
    const cb = w.body.querySelector('[data-sound-enable]');
    cb.addEventListener('change', () => {
      RW.Audio.resume();
      RW.Audio.setEnabled(cb.checked);
    });
    const sel = w.body.querySelector('[data-scheme]');
    sel.addEventListener('change', () => {
      RW.Audio.setScheme && RW.Audio.setScheme(sel.value);
      try { sessionStorage.setItem('rw93_sound_scheme', sel.value); } catch (e) {}
    });
    w.body.querySelector('[data-test]').addEventListener('click', () => {
      RW.Audio.resume(); RW.Audio.ding();
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }

  function openDateTimeCP() {
    const html =
      '<div class="dialog-body">' +
        '<p><b>Date/Time Properties</b></p>' +
        '<p>Current system date and time:</p>' +
        '<p class="dt-display" data-dt style="font-family:Courier New,monospace;font-size:16px;background:#fff;padding:6px;border:2px inset #c0c0c0;text-align:center"></p>' +
      '</div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Date/Time Properties', icon: clockCpIcon(),
      width: 360, height: 220, resizable: false, contentHTML: html
    });
    const out = w.body.querySelector('[data-dt]');
    function tick() {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      let h = d.getHours();
      const min = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12; if (h === 0) h = 12;
      out.textContent = mm + '/' + dd + '/' + yyyy + '  ' + h + ':' + min + ':' + sec + ' ' + ampm;
    }
    tick();
    const id = setInterval(tick, 1000);
    const prevClose = w.onClose;
    w.onClose = function () { clearInterval(id); if (prevClose) prevClose(); };
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }

  function openMouseCP() {
    const speeds = ['Real Slow','Slow','Just Right','Fast','Sonic'];
    let html =
      '<div class="dialog-body">' +
        '<p><b>Mouse Properties</b></p>' +
        '<p>Pointer speed:</p>';
    speeds.forEach((s, i) => {
      html += '<label class="mouse-speed-row"><input type="radio" name="ms" value="' + i + '" ' +
        (i === 2 ? 'checked' : '') + ' data-speed' + (i === 4 ? ' title="Not implemented. Try not to be sad."' : '') + '> ' +
        '<span' + (i === 4 ? ' title="Not implemented. Try not to be sad."' : '') + '>' + s + '</span></label>';
    });
    html += '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Mouse Properties', icon: mouseCpIcon(),
      width: 360, height: 280, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }

  function openAddRemoveCP() {
    const rows = [
      ['Sycophancy.exe', 'incompatible with the work'],
      ['QuickFix.exe',   'no such thing'],
      ['Burnout.dll',    'opted out']
    ];
    let html =
      '<div class="dialog-body">' +
        '<p><b>Add/Remove Programs Properties</b></p>' +
        '<p>Software you cannot install on this system:</p>' +
        '<div class="arp-list">' +
          rows.map(r => '<div class="arp-row"><span class="arp-name">' + RW.WM.escapeHtml(r[0]) +
            '</span><span class="arp-reason">Reason: ' + RW.WM.escapeHtml(r[1]) + '</span></div>').join('') +
        '</div>' +
      '</div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const w = RW.WM.open({
      title: 'Add/Remove Programs Properties', icon: arpCpIcon(),
      width: 420, height: 280, resizable: false, contentHTML: html
    });
    w.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(w.id));
  }

  function openRecycle() {
    if (RW.WM.get('recycle-bin')) { RW.WM.bringToFront('recycle-bin'); return; }
    const rows = [
      { name: 'Bad ideas',                              size: '3.4 MB',
        restore: 'Restored. They will return on their own anyway.' },
      { name: 'Notes from a 2009 student film',         size: '1.1 MB',
        restore: 'Restored. We were so close to something.' },
      { name: 'the first draft',                        size: '8.7 GB',
        restore: 'Restored. The first draft was the lesson, not the film.' }
    ];
    const wrap = document.createElement('div');
    wrap.className = 'recycle-body';
    wrap.innerHTML =
      '<div class="recycle-toolbar">' +
        '<button class="mm-btn" data-empty>Empty Recycle Bin</button>' +
        '<button class="mm-btn" data-close>Close</button>' +
      '</div>' +
      '<div class="recycle-list">' +
        '<div class="recycle-row recycle-head"><span class="rr-name">Name</span><span class="rr-size">Size</span></div>' +
        rows.map((r, i) => '<div class="recycle-row" data-idx="' + i + '">' +
          '<span class="rr-icon"><svg viewBox="0 0 32 32" width="20" height="20"><path d="M6 2h16l6 6v22H6z" fill="#fff" stroke="#000"/></svg></span>' +
          '<span class="rr-name">' + RW.WM.escapeHtml(r.name) + '</span>' +
          '<span class="rr-size">' + RW.WM.escapeHtml(r.size) + '</span>' +
        '</div>').join('') +
      '</div>' +
      '<div class="status-bar"><div class="sb-cell">' + rows.length + ' object(s)</div><div class="sb-cell" style="margin-left:auto">Recycle Bin</div></div>';
    const w = RW.WM.open({
      id: 'recycle-bin', title: 'Recycle Bin', icon: ICONS.recycle,
      width: 460, height: 320, contentNode: wrap
    });
    w.body.style.padding = '0';

    function info(title, body) {
      const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(body) + '</p></div>' +
        '<div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({
        title: title, icon: ICONS.recycle,
        width: 380, height: 160, resizable: false, contentHTML: html
      });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
    }

    wrap.querySelectorAll('.recycle-row[data-idx]').forEach(row => {
      const idx = parseInt(row.dataset.idx, 10);
      row.addEventListener('click', () => {
        wrap.querySelectorAll('.recycle-row.selected').forEach(x => x.classList.remove('selected'));
        row.classList.add('selected');
      });
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        RW.ContextMenu.show(e.clientX, e.clientY, [
          { label: 'Restore', action: () => info('Restore', rows[idx].restore) },
          { label: 'Delete',  action: () => info('Delete', 'Deleted. Some things should stay deleted.') }
        ]);
      });
    });
    wrap.querySelector('[data-empty]').addEventListener('click', () => {
      info('Recycle Bin', 'Recycle Bin emptied. The work continues.');
      if (RW.Audio) RW.Audio.ding();
    });
    wrap.querySelector('[data-close]').addEventListener('click', () => RW.WM.close('recycle-bin'));
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
