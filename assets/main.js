// RICK WAYNE 93 - main.js
// Boot sequence, desktop icon rendering, content windows, start menu, easter egg.

(function () {
  // ---------- BOOT ----------
  const bootLines = [
    "RW BIOS v2.6.1993  Copyright (C) RICK WAYNE",
    "",
    "Detecting CPU................. OK",
    "Detecting Memory.............. 640K OK",
    "Detecting Imagination......... LOADED",
    "Detecting Curiosity........... LOADED",
    "Detecting Caffeine............ LOW. Continuing.",
    "",
    "Press DEL to enter SETUP. Do not press DEL.",
    "",
    "Booting DIRECTOR.SYS...",
    "Loading UNDERSCORE.DLL........ OK",
    "Loading STORYBOARD.VXD........ OK",
    "Loading TREATMENT.EXE......... OK",
    "Loading REELS\\1186763796.MOV.. OK",
    "Mounting WORLD_BUILDER......... OK",
    "",
    "RICK WAYNE",
    "DIRECTOR / CREATIVE DIRECTOR",
    "UNDERSCORE FILMS - BROOKLYN, NY",
    "",
    "Type 'rick' anywhere for easter egg.",
    ""
  ];

  function boot() {
    const screen = document.getElementById('boot-screen');
    const text = document.getElementById('boot-text');
    const prompt = document.getElementById('boot-prompt');
    let i = 0, j = 0;
    let advanced = false;
    text.textContent = '';

    const finish = () => {
      if (advanced) return;
      advanced = true;
      document.removeEventListener('keydown', onInput);
      screen.removeEventListener('click', onInput);
      screen.style.transition = 'opacity 320ms';
      screen.style.opacity = '0';
      if (window.Sound) window.Sound.boot();
      setTimeout(() => {
        if (screen.parentNode) screen.remove();
        const dt = document.getElementById('desktop');
        if (dt) dt.hidden = false;
        startClock();
      }, 360);
    };

    function fillRemaining() {
      const remaining = bootLines.slice(i);
      const head = remaining[0] ? remaining[0].slice(j) + '\n' : '';
      text.textContent += head + remaining.slice(1).join('\n');
      i = bootLines.length;
      prompt.hidden = false;
    }

    function typeLine() {
      if (advanced) return;
      if (i >= bootLines.length) {
        prompt.hidden = false;
        return;
      }
      const line = bootLines[i];
      if (j < line.length) {
        text.textContent += line.charAt(j++);
        const delay = (line.charAt(j - 1) === '.' ? 12 : 5) + Math.random() * 8;
        setTimeout(typeLine, delay);
      } else {
        text.textContent += '\n';
        i++; j = 0;
        const pause = bootLines[i - 1] === "" ? 90 : 30;
        setTimeout(typeLine, pause);
      }
    }

    // Any input either flushes (if typing not done) or finishes.
    const onInput = () => {
      if (advanced) return;
      if (prompt.hidden) fillRemaining();
      else finish();
    };
    document.addEventListener('keydown', onInput);
    screen.addEventListener('click', onInput);

    typeLine();
  }

  // ---------- DESKTOP ICONS ----------
  function svgIcon(kind) {
    // Returns an inline SVG string used both for desktop icons and window title icons.
    switch (kind) {
      case 'exe':
        return `<svg class="icon-img" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="5" y="3" width="22" height="26" fill="#ffffff" stroke="#000"/>
          <rect x="5" y="3" width="22" height="4"  fill="#000080"/>
          <rect x="7" y="11" width="18" height="2" fill="#000080"/>
          <rect x="7" y="15" width="14" height="2" fill="#808080"/>
          <rect x="7" y="19" width="18" height="2" fill="#808080"/>
          <rect x="7" y="23" width="10" height="2" fill="#808080"/>
          <rect x="20" y="22" width="6" height="5" fill="#000080"/>
          <text x="23" y="26" font-family="monospace" font-size="4" fill="#fff" text-anchor="middle">.EX</text>
        </svg>`;
      case 'folder':
        return `<svg class="icon-img" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="3" y="10" width="26" height="18" fill="#dfb84e" stroke="#000"/>
          <polygon points="3,10 12,10 14,8 3,8" fill="#dfb84e" stroke="#000"/>
          <rect x="3" y="13" width="26" height="2" fill="#a8862a"/>
        </svg>`;
      case 'notepad':
        return `<svg class="icon-img" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="6" y="3" width="20" height="26" fill="#fff" stroke="#000"/>
          <polygon points="20,3 26,9 20,9" fill="#c0c0c0" stroke="#000"/>
          <line x1="9" y1="13" x2="22" y2="13" stroke="#0000a0"/>
          <line x1="9" y1="16" x2="22" y2="16" stroke="#0000a0"/>
          <line x1="9" y1="19" x2="20" y2="19" stroke="#0000a0"/>
          <line x1="9" y1="22" x2="22" y2="22" stroke="#0000a0"/>
          <line x1="9" y1="25" x2="18" y2="25" stroke="#0000a0"/>
        </svg>`;
      case 'mail':
        return `<svg class="icon-img" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="3" y="8" width="26" height="18" fill="#fff" stroke="#000"/>
          <polyline points="3,8 16,20 29,8" fill="none" stroke="#000"/>
          <rect x="3" y="8" width="26" height="3" fill="#000080"/>
        </svg>`;
      case 'press':
        return `<svg class="icon-img" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="4" y="5" width="24" height="22" fill="#fff" stroke="#000"/>
          <rect x="6" y="8" width="20" height="3" fill="#000"/>
          <rect x="6" y="13" width="9" height="9" fill="#808080"/>
          <line x1="16" y1="14" x2="26" y2="14" stroke="#000"/>
          <line x1="16" y1="16" x2="26" y2="16" stroke="#000"/>
          <line x1="16" y1="18" x2="26" y2="18" stroke="#000"/>
          <line x1="16" y1="20" x2="22" y2="20" stroke="#000"/>
          <line x1="6"  y1="24" x2="26" y2="24" stroke="#000"/>
        </svg>`;
      default:
        return svgIcon('exe');
    }
  }

  function smallIcon(kind) {
    // 16x16 icons for window title bars
    const svg = svgIcon(kind);
    return svg.replace('class="icon-img"', 'class="window-title-icon" style="width:16px;height:16px;"');
  }

  function renderDesktopIcons() {
    const list = document.getElementById('desktop-icons');
    list.innerHTML = '';

    // Projects
    RW.projects.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'desktop-icon';
      li.tabIndex = 0;
      li.dataset.id = p.id;
      li.innerHTML = `${svgIcon('exe')}<div class="icon-label">${escapeHTML(p.exe)}</div>`;
      bindIconOpen(li, () => openProject(p.id));
      list.appendChild(li);
    });

    // My Reels (folder)
    const reels = document.createElement('li');
    reels.className = 'desktop-icon';
    reels.tabIndex = 0;
    reels.innerHTML = `${svgIcon('folder')}<div class="icon-label">My Reels</div>`;
    bindIconOpen(reels, openReels);
    list.appendChild(reels);

    // About
    const about = document.createElement('li');
    about.className = 'desktop-icon';
    about.tabIndex = 0;
    about.innerHTML = `${svgIcon('notepad')}<div class="icon-label">About Me.txt</div>`;
    bindIconOpen(about, openAbout);
    list.appendChild(about);

    // Contact
    const contact = document.createElement('li');
    contact.className = 'desktop-icon';
    contact.tabIndex = 0;
    contact.innerHTML = `${svgIcon('mail')}<div class="icon-label">Contact.eml</div>`;
    bindIconOpen(contact, openContact);
    list.appendChild(contact);

    // Press
    const press = document.createElement('li');
    press.className = 'desktop-icon';
    press.tabIndex = 0;
    press.innerHTML = `${svgIcon('press')}<div class="icon-label">Press.lnk</div>`;
    bindIconOpen(press, openPress);
    list.appendChild(press);
  }

  function bindIconOpen(el, fn) {
    let lastTap = 0;
    el.addEventListener('dblclick', () => { if (window.Sound) window.Sound.click(); fn(); });
    el.addEventListener('click', () => {
      // selection feedback
      document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (window.Sound) window.Sound.click(); fn(); }
    });
    // Touch / single-click open friendliness: a second click within 400ms also opens.
    el.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTap < 400) { if (window.Sound) window.Sound.click(); fn(); }
      lastTap = now;
    });
  }

  // ---------- WINDOW CONTENT ----------
  function openProject(id) {
    const p = RW.projects.find(x => x.id === id);
    if (!p) return;
    const winId = 'win-proj-' + id;

    if (!p.built) {
      const body = `
        <div class="under-construction">
          <div class="uc-sign">UNDER CONSTRUCTION</div>
          <p><strong>${escapeHTML(p.title)}</strong></p>
          <p>${escapeHTML(p.client || '')} &middot; ${escapeHTML(p.years || '')}</p>
          <p>${escapeHTML(p.copy_short || '')}</p>
          <pre class="uc-art">
   ___________________
  |  o   o   o   o   |
  |  ===  WORKERS  ==|
  |__________________|
        |    |
        |    |
       _|____|_
          </pre>
          <p style="margin-top:14px;">This project window is being assembled.<br/>
          The desktop and windowing system still work, though.</p>
        </div>`;
      WM.open({
        id: winId,
        title: p.exe,
        icon: smallIcon('exe'),
        width: 460, height: 360,
        body,
        status: p.title
      });
      return;
    }

    // Fully built window (Sharpie ROTY + Graco)
    const score = (p.scoreboard || []).map(s =>
      `<div class="score-tile"><span class="score-value">${escapeHTML(s.value)}</span><span class="score-label">${escapeHTML(s.label)}</span></div>`
    ).join('');

    const years = (p.years_detail || []).map(y =>
      `<div class="proj-year-row">
         <span class="year-tag">${escapeHTML(y.year)} ${escapeHTML(y.label || '')}</span>
         <span>${escapeHTML(y.headline || '')}</span>
       </div>`
    ).join('');

    const body = `
      <div class="proj-header">
        <img class="proj-thumb" src="${p.thumbnail}" alt="${escapeHTML(p.title)}" onerror="this.style.display='none';"/>
        <div>
          <h2 class="proj-title">${escapeHTML(p.title)}</h2>
          <p class="proj-meta">
            <strong>Client:</strong> ${escapeHTML(p.client || '')}<br/>
            ${p.agency ? `<strong>Agency:</strong> ${escapeHTML(p.agency)}<br/>` : ''}
            <strong>Year${p.years && p.years.includes('-') ? 's' : ''}:</strong> ${escapeHTML(p.years || '')}<br/>
            <strong>Role:</strong> ${escapeHTML(p.role || '')}
          </p>
        </div>
      </div>

      ${p.reel_embed ? `<iframe class="proj-video" src="${p.reel_embed}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>` : ''}

      <p class="proj-copy">${escapeHTML(p.copy_short || '')}</p>
      ${p.tagline ? `<p class="proj-copy" style="font-family:'Press Start 2P',monospace;font-size:11px;color:#0a246a;">// ${escapeHTML(p.tagline)}</p>` : ''}

      ${years ? `<div class="proj-years"><h4>// THE ARC</h4>${years}</div>` : ''}

      ${score ? `<div class="proj-scoreboard">${score}</div>` : ''}

      ${p.case_study_url ? `<p style="margin-top:14px;font-size:14px;">Full case study on the standard site: <a href="${p.case_study_url}" target="_blank" rel="noopener">${escapeHTML(p.case_study_url)}</a></p>` : ''}
    `;

    WM.open({
      id: winId,
      title: p.exe,
      icon: smallIcon('exe'),
      width: 680, height: 540,
      body,
      status: `${p.title} - Ready.`
    });
  }

  function openReels() {
    const items = RW.projects.map(p => `
      <div class="folder-item" data-id="${p.id}">
        ${p.thumbnail ? `<img src="${p.thumbnail}" alt=""/>` : `<div class="fi-svg">${svgIcon('exe')}</div>`}
        <div>${escapeHTML(p.exe)}</div>
      </div>`).join('');
    const body = `
      <div class="window-menubar">
        <span class="menu-item"><span class="ul">F</span>ile</span>
        <span class="menu-item"><span class="ul">E</span>dit</span>
        <span class="menu-item"><span class="ul">V</span>iew</span>
        <span class="menu-item"><span class="ul">H</span>elp</span>
      </div>
      <div class="folder-grid">${items}</div>
    `;
    const w = WM.open({
      id: 'win-reels',
      title: 'My Reels',
      icon: smallIcon('folder'),
      width: 540, height: 420,
      body,
      status: `${RW.projects.length} object(s).`
    });
    w.querySelectorAll('.folder-item').forEach(it => {
      it.addEventListener('dblclick', () => { if (window.Sound) window.Sound.click(); openProject(it.dataset.id); });
      it.addEventListener('click', () => { it.style.outline = '1px dotted #000'; setTimeout(() => it.style.outline = '', 600); });
    });
  }

  function openAbout() {
    const beliefs = RW.bio.beliefs.map(b => `<li>${escapeHTML(b)}</li>`).join('');
    const body = `
      <div class="window-menubar">
        <span class="menu-item"><span class="ul">F</span>ile</span>
        <span class="menu-item"><span class="ul">E</span>dit</span>
        <span class="menu-item"><span class="ul">S</span>earch</span>
        <span class="menu-item"><span class="ul">H</span>elp</span>
      </div>
      <div class="notepad-body">
        <h2>// ABOUT_ME.TXT</h2>
        <p><strong>${escapeHTML(RW.bio.name)}</strong> - ${escapeHTML(RW.bio.tagline)}</p>
        <p>${escapeHTML(RW.bio.location)} - ${escapeHTML(RW.bio.company)} - ${escapeHTML(RW.bio.agency)}</p>
        <hr/>
        <p>${escapeHTML(RW.bio.long)}</p>
        <p><em>${escapeHTML(RW.bio.subhed)}</em></p>
        <h2 style="margin-top:14px;">// I BELIEVE</h2>
        <ol>${beliefs}</ol>
      </div>`;
    WM.open({
      id: 'win-about',
      title: 'About Me.txt - Notepad',
      icon: smallIcon('notepad'),
      width: 600, height: 520,
      body,
      status: 'Notepad - About Me.txt'
    });
  }

  function openContact() {
    const body = `
      <div class="window-menubar">
        <span class="menu-item"><span class="ul">F</span>ile</span>
        <span class="menu-item"><span class="ul">E</span>dit</span>
        <span class="menu-item"><span class="ul">V</span>iew</span>
        <span class="menu-item"><span class="ul">M</span>essage</span>
      </div>
      <div class="eml-body">
        <div class="eml-headers">
          <div><span>From:</span><span>You</span></div>
          <div><span>To:</span><span>Rick Wayne &lt;rick@underscorefilms&gt;</span></div>
          <div><span>Subject:</span><span>Let's make something</span></div>
          <div><span>Date:</span><span>${new Date().toDateString()}</span></div>
        </div>
        <p>Hey Rick,</p>
        <p>Loved the reel. We have a project that needs a director who can build a world. Want to jump on a call?</p>
        <p>Brand: ______________________<br/>
           Timing: ______________________<br/>
           Budget range: _______________</p>
        <br/>
        <p>Best,<br/>
        ______________________</p>
        <hr style="margin:14px 0;"/>
        <p style="font-size:14px;color:#808080;">
          Find Rick: <a href="${RW.contact.instagram}" target="_blank" rel="noopener">Instagram @rick_wayne</a>
          - <a href="${RW.contact.vimeo}" target="_blank" rel="noopener">Vimeo</a>
        </p>
        <p style="font-size:14px;color:#808080;">${escapeHTML(RW.contact.city)}</p>
      </div>`;
    WM.open({
      id: 'win-contact',
      title: 'Contact.eml - Inbox',
      icon: smallIcon('mail'),
      width: 520, height: 460,
      body,
      status: 'Inbox - 1 unread'
    });
  }

  function openPress() {
    const list = RW.press.map(p => `
      <li><strong>${escapeHTML(p.outlet)}</strong>${p.date ? ' &middot; ' + escapeHTML(p.date) : ''}<br/>
        <a href="${p.url}" target="_blank" rel="noopener">${escapeHTML(p.title)}</a></li>`).join('');
    const body = `
      <div class="window-menubar">
        <span class="menu-item"><span class="ul">F</span>ile</span>
        <span class="menu-item"><span class="ul">V</span>iew</span>
      </div>
      <div class="notepad-body">
        <h2>// PRESS.LNK</h2>
        <p>External links. Opens in new tab.</p>
        <ul class="press-list">${list}</ul>
      </div>`;
    WM.open({
      id: 'win-press',
      title: 'Press.lnk',
      icon: smallIcon('press'),
      width: 540, height: 480,
      body,
      status: `${RW.press.length} press item(s).`
    });
  }

  // ---------- CLOCK ----------
  function startClock() {
    const el = document.getElementById('clock');
    function tick() {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const am = h < 12 ? 'AM' : 'PM';
      h = h % 12; if (h === 0) h = 12;
      el.textContent = `${h}:${m.toString().padStart(2, '0')} ${am}`;
    }
    tick();
    setInterval(tick, 15000);
  }

  // ---------- START MENU ----------
  function wireStartMenu() {
    const btn = document.getElementById('start-btn');
    const menu = document.getElementById('start-menu');
    const close = () => { menu.hidden = true; btn.classList.remove('active'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      btn.classList.toggle('active', !menu.hidden);
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== btn) close();
    });
    menu.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-action]');
      if (!li) return;
      const a = li.dataset.action;
      close();
      if (window.Sound) window.Sound.click();
      switch (a) {
        case 'open-reels':   openReels(); break;
        case 'open-about':   openAbout(); break;
        case 'open-contact': openContact(); break;
        case 'open-press':   openPress(); break;
        case 'toggle-sound': toggleSound(); break;
        case 'shutdown':     fakeShutdown(); break;
      }
    });
  }

  function fakeShutdown() {
    triggerBSOD("It is now safe to imagine your next thing.\nPress any key to come back.");
  }

  // ---------- SOUND TOGGLE ----------
  function toggleSound() {
    const btn = document.getElementById('sound-toggle');
    const ico = document.getElementById('sound-icon');
    if (!window.Sound) return;
    const on = window.Sound.toggle();
    ico.innerHTML = on ? '&#128266;' : '&#128263;';
    btn.title = on ? 'Sound is ON. Click to mute.' : 'Sound is OFF. Click to turn ON.';
    if (on) window.Sound.click();
  }

  // ---------- RECYCLE BIN DRAG ----------
  function wireRecycleDrag() {
    const bin = document.getElementById('recycle-bin');
    const surf = document.getElementById('desktop-surface');
    let dragging = false, ox = 0, oy = 0;
    bin.addEventListener('mousedown', (e) => {
      dragging = true;
      const r = bin.getBoundingClientRect();
      const sr = surf.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      bin.style.right = 'auto';
      bin.style.bottom = 'auto';
      bin.style.left = (r.left - sr.left) + 'px';
      bin.style.top = (r.top - sr.top) + 'px';
      document.body.classList.add('dragging');
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const sr = surf.getBoundingClientRect();
      let nx = e.clientX - sr.left - ox;
      let ny = e.clientY - sr.top - oy;
      nx = Math.max(0, Math.min(sr.width - bin.offsetWidth, nx));
      ny = Math.max(0, Math.min(sr.height - bin.offsetHeight, ny));
      bin.style.left = nx + 'px';
      bin.style.top = ny + 'px';
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('dragging');
    });
    // Double-click bin = sass
    bin.addEventListener('dblclick', () => {
      if (window.Sound) window.Sound.click();
      WM.open({
        id: 'win-bin',
        title: 'Recycle Bin',
        icon: '',
        width: 380, height: 220,
        body: `<div style="padding:20px;text-align:center;font-size:18px;">
                 <p>Recycle Bin is <strong>empty.</strong></p>
                 <p style="font-size:14px;color:#808080;margin-top:10px;">
                   Drafts get cut, not kept.
                 </p>
               </div>`,
        status: '0 object(s).'
      });
    });
  }

  // ---------- EASTER EGG: type "rick" anywhere ----------
  function wireRickEgg() {
    const target = 'rick';
    let buf = '';
    document.addEventListener('keydown', (e) => {
      const k = (e.key || '').toLowerCase();
      if (k.length !== 1) return;
      buf = (buf + k).slice(-target.length);
      if (buf === target) {
        triggerBSOD();
      }
    });
  }

  function triggerBSOD(custom) {
    const el = document.getElementById('bsod');
    if (custom) {
      const inner = el.querySelector('.bsod-inner');
      inner.innerHTML = `<div class="bsod-bar">RICK_WAYNE.SYS</div><pre style="font-family:inherit;font-size:inherit;margin:0;">${escapeHTML(custom)}</pre>`;
    }
    el.hidden = false;
    if (window.Sound) window.Sound.error();
    const dismiss = () => {
      document.removeEventListener('keydown', dismiss);
      el.removeEventListener('click', dismiss);
      el.hidden = true;
    };
    setTimeout(() => {
      document.addEventListener('keydown', dismiss);
      el.addEventListener('click', dismiss);
    }, 300);
  }

  // ---------- BOOT ----------
  document.addEventListener('DOMContentLoaded', () => {
    WM.init(document.getElementById('window-layer'), document.getElementById('task-buttons'));
    renderDesktopIcons();
    wireStartMenu();
    wireRecycleDrag();
    wireRickEgg();
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    boot();
  });
})();
