/* mobile.js - v6 mobile portfolio bundle.
   Standalone. Does NOT depend on the desktop OS modules (wm, explorer, etc).
   Reads content from RW.CONTENT (provided by content.js) which itself sources
   bio / projects / press from data.js. Renders the entire mobile experience
   into <div id="mobile-root">. */

(function () {
  const RW = window.RW = window.RW || {};
  if (!RW.CONTENT) {
    console.error('mobile.js: RW.CONTENT missing. Did js/content.js load?');
    return;
  }

  const C = RW.CONTENT;
  let root = null; // resolved in init()

  // Cache projects in sessionStorage (spec asks for this).
  try {
    sessionStorage.setItem('rw_projects_cache', JSON.stringify(C.projects));
  } catch (e) {}

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---------- Boot ----------
  function renderBoot(onDone) {
    const boot = document.createElement('div');
    boot.className = 'm-boot';
    boot.setAttribute('role', 'status');
    boot.innerHTML =
      '<div class="m-boot-text">Loading Rick\'s Nostalgia...</div>' +
      '<div class="m-boot-bar-wrap"><div class="m-boot-bar" id="m-boot-bar"></div></div>' +
      '<div class="m-boot-skip">Tap to skip</div>';
    document.body.appendChild(boot);

    let done = false;
    function finish() {
      if (done) return;
      done = true;
      boot.style.transition = 'opacity 250ms ease';
      boot.style.opacity = '0';
      setTimeout(() => {
        if (boot.parentNode) boot.parentNode.removeChild(boot);
        onDone();
      }, 260);
    }
    boot.addEventListener('click', finish);

    const bar = boot.querySelector('#m-boot-bar');
    const start = Date.now();
    const dur = 1900;
    const interval = setInterval(function () {
      if (done) { clearInterval(interval); return; }
      const p = Math.min(1, (Date.now() - start) / dur);
      bar.style.width = (p * 100) + '%';
      if (p >= 1) {
        clearInterval(interval);
        finish();
      }
    }, 60);
  }

  // ---------- Main shell ----------
  function renderShell() {
    const featured = C.projects.find(p => p.id === 'sharpie-roty') || C.projects[0];

    document.body.classList.add('mobile-mode');
    document.documentElement.classList.add('mobile-mode');

    root.innerHTML =
      // Header
      '<header class="m-header">' +
        '<div class="m-header-inner">' +
          '<a class="m-brand" href="#top" data-flag-tap aria-label="Top">' +
            '<span class="m-flag" aria-hidden="true">' +
              '<span class="q1"></span><span class="q2"></span>' +
              '<span class="q3"></span><span class="q4"></span>' +
            '</span>' +
            '<span class="m-name">rick wayne<small>director</small></span>' +
          '</a>' +
          '<button class="m-burger" id="m-burger" aria-label="Menu" type="button">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</header>' +
      // Drawer
      '<div class="m-drawer-bg" id="m-drawer-bg"></div>' +
      '<aside class="m-drawer" id="m-drawer" role="menu">' +
        '<div class="m-drawer-head"><span>Menu</span><button class="m-drawer-close" id="m-drawer-close" type="button">X</button></div>' +
        '<ul class="m-drawer-list">' +
          '<li><a href="#work">Work</a></li>' +
          '<li><a href="#about">About</a></li>' +
          '<li><a href="#press">Press</a></li>' +
          '<li><a href="#contact">Contact</a></li>' +
        '</ul>' +
      '</aside>' +
      // PTR
      '<div class="m-ptr" id="m-ptr">Refreshing...</div>' +
      // Top anchor
      '<a id="top" aria-hidden="true"></a>' +
      // Hero
      '<section class="m-hero">' +
        '<div class="m-hero-video-wrap">' +
          '<iframe id="m-hero-iframe" src="' + heroVimeoSrc(featured.vimeoId) +
            '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>' +
          '<button class="m-hero-mute" id="m-hero-mute" type="button">Tap to unmute</button>' +
        '</div>' +
        '<div class="m-hero-overlay">' +
          '<h1 class="m-hero-name">' + esc(C.bio.name) + '</h1>' +
          '<p class="m-hero-tag">' + esc(C.bio.tagline) + '. ' + esc(C.bio.location) + '.</p>' +
          '<a class="m-hero-cta" href="#work">See Work &#9660;</a>' +
        '</div>' +
      '</section>' +
      // Work
      '<section class="m-section" id="work">' +
        '<h2 class="m-h">Work</h2>' +
        '<div class="m-tiles" id="m-tiles"></div>' +
      '</section>' +
      // About
      '<section class="m-section alt" id="about">' +
        '<h2 class="m-h">About</h2>' +
        '<div class="m-about">' +
          '<div class="m-matrix-frame">' +
            '<div class="m-matrix-titlebar"><span>Untitled.bmp - Paint</span><span>_ [] X</span></div>' +
            '<div class="m-matrix-canvas" id="m-matrix-tap">' +
              '<img src="' + esc(C.about.matrixImage) + '" alt="Rick\'s first shoot, 2003">' +
            '</div>' +
          '</div>' +
          '<p class="m-matrix-caption">' + esc(C.about.firstShootCaption) + '</p>' +
          aboutBodyHTML() +
          '<button class="m-mm-cta" id="m-mm-open" type="button">Send Rick a Movie Maker message</button>' +
        '</div>' +
      '</section>' +
      // Press
      '<section class="m-section" id="press">' +
        '<h2 class="m-h">Press</h2>' +
        '<div class="m-press-list" id="m-press"></div>' +
      '</section>' +
      // Desktop link
      '<div class="m-desktop-link">' +
        '<a href="#" id="m-go-desktop">Desktop experience &#8594;</a>' +
        '<div style="font-size:11px;color:#888;margin-top:4px">best viewed on a computer</div>' +
      '</div>' +
      // Bottom pad so pinned footer doesn't cover content
      '<div class="m-content-bottom-pad" id="contact"></div>' +
      // Pinned contact
      '<div class="m-pinned">' +
        '<a class="m-email-btn" href="mailto:' + esc(C.bio.email) + '">Email Rick</a>' +
        '<div class="m-socials">' +
          '<a href="' + esc(C.bio.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + igIcon() + '</a>' +
          '<a href="' + esc(C.bio.linkedin || 'https://www.linkedin.com/in/rickwaynenyc/') + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + liIcon() + '</a>' +
          '<a href="' + esc(C.bio.vimeo || 'https://vimeo.com/rickwayne') + '" target="_blank" rel="noopener" aria-label="Vimeo">' + viIcon() + '</a>' +
        '</div>' +
      '</div>' +
      // Player and dialog containers
      '<div class="m-player" id="m-player" role="dialog" aria-modal="true" aria-hidden="true"></div>' +
      '<div class="m-dialog-bg" id="m-dialog-bg"><div class="m-dialog" id="m-dialog" role="dialog" aria-modal="true"></div></div>' +
      '<div class="m-ctx" id="m-ctx" role="menu"></div>' +
      '<div class="m-mm-modal" id="m-mm-modal" role="dialog" aria-modal="true" aria-hidden="true"></div>';

    renderTiles();
    renderPress();
    wireShell();
    setupTileAutoplay();
    setupPullToRefresh();
  }

  function heroVimeoSrc(id) {
    return 'https://player.vimeo.com/video/' + id +
      '?background=1&autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1';
  }
  function reelVimeoSrc(id) {
    return 'https://player.vimeo.com/video/' + id +
      '?background=1&autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1';
  }
  function fullVimeoSrc(id) {
    return 'https://player.vimeo.com/video/' + id +
      '?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1';
  }

  function aboutBodyHTML() {
    // Intro with tappable "1989" + I Believe section. About copy from RW.CONTENT.about.
    const intro = esc(C.about.intro)
      .replace('1989', '<span class="year-tap" id="m-year-tap" tabindex="0">1989</span>');
    return (
      '<h3 class="m-about-h2">' + esc(C.about.firstShootHeading) + '</h3>' +
      '<p>' + intro + '</p>' +
      '<h3 class="m-about-h2">' + esc(C.about.believeHeading) + '</h3>' +
      '<p>' + esc(C.about.believeCopy) + '</p>'
    );
  }

  // ---------- Tile rendering ----------
  function renderTiles() {
    const wrap = document.getElementById('m-tiles');
    wrap.innerHTML = C.projects.map(function (p, i) {
      return (
        '<a class="m-tile" data-pid="' + esc(p.id) + '" data-idx="' + i + '">' +
          '<div class="m-tile-media" data-vimeo="' + esc(p.vimeoId) + '">' +
            '<img loading="lazy" src="' + esc(p.thumbnail || ('https://vumbnail.com/' + p.vimeoId + '.jpg')) + '" alt="' + esc(p.title) + '">' +
            '<span class="m-tile-play">PLAY</span>' +
          '</div>' +
          '<div class="m-tile-meta">' +
            '<div class="m-tile-title">' + esc(p.title) + '</div>' +
            '<div class="m-tile-sub">' + esc(p.client || '') + ' &middot; ' + esc(p.year || '') + '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');

    wrap.querySelectorAll('.m-tile').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openPlayer(el.dataset.pid);
      });

      // Long press for context menu
      let lpTimer = null;
      let lpFired = false;
      el.addEventListener('touchstart', function () {
        lpFired = false;
        lpTimer = setTimeout(function () {
          lpFired = true;
          openTileContext(el.dataset.pid);
        }, 600);
      }, { passive: true });
      el.addEventListener('touchend', function (e) {
        if (lpTimer) clearTimeout(lpTimer);
        if (lpFired) { e.preventDefault(); e.stopPropagation(); }
      });
      el.addEventListener('touchmove', function () {
        if (lpTimer) clearTimeout(lpTimer);
      }, { passive: true });
      el.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        openTileContext(el.dataset.pid);
      });
    });
  }

  // Intersection observer for autoplay
  function setupTileAutoplay() {
    if (!('IntersectionObserver' in window)) return;
    const seen = new WeakSet();
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        const media = en.target;
        const vid = media.dataset.vimeo;
        if (en.intersectionRatio > 0.55 && !seen.has(media)) {
          seen.add(media);
          const ifr = document.createElement('iframe');
          ifr.src = reelVimeoSrc(vid);
          ifr.allow = 'autoplay; picture-in-picture';
          ifr.setAttribute('playsinline', '');
          ifr.setAttribute('aria-hidden', 'true');
          media.appendChild(ifr);
        } else if (en.intersectionRatio < 0.15 && seen.has(media)) {
          // tear down to save resources
          const ifr = media.querySelector('iframe');
          if (ifr) ifr.remove();
          seen.delete(media);
        }
      });
    }, { threshold: [0.15, 0.55] });
    document.querySelectorAll('.m-tile-media').forEach(function (m) { io.observe(m); });
  }

  // ---------- Player ----------
  function openPlayer(pid) {
    const p = C.projects.find(x => x.id === pid);
    if (!p) return;
    const player = document.getElementById('m-player');
    let info = '<h3>' + esc(p.title) + '</h3>';
    if (p.tagline) info += '<div class="m-pi-tag">' + esc(p.tagline) + '</div>';
    info += '<div class="m-pi-meta"><b>Client:</b> ' + esc(p.client || '') + '</div>';
    if (p.agency) info += '<div class="m-pi-meta"><b>Agency:</b> ' + esc(p.agency) + '</div>';
    info += '<div class="m-pi-meta"><b>Year:</b> ' + esc(p.year || '') + '</div>';
    info += '<div class="m-pi-meta"><b>Role:</b> ' + esc(p.role || '') + '</div>';
    if (p.copy) info += '<p class="m-pi-copy">' + esc(p.copy) + '</p>';
    if (p.scoreboard && p.scoreboard.length) {
      info += '<div style="font-family:var(--m-chrome-font);font-size:13px;letter-spacing:1px;margin-top:14px"><b>SCOREBOARD</b></div>';
      info += '<div class="m-scoreboard">';
      p.scoreboard.forEach(function (t) {
        info += '<div class="tile"><div class="val">' + esc(t.value) + '</div><div class="lbl">' + esc(t.label) + '</div></div>';
      });
      info += '</div>';
    } else if (!p.built) {
      info += '<div class="m-pi-meta" style="margin-top:12px;color:#666">Full case study in development.</div>';
    }

    player.innerHTML =
      '<div class="m-player-bar"><span>Windows Media Player - ' + esc(p.filename || (p.title + '.mp4')) + '</span>' +
        '<button class="m-player-close" id="m-player-close" type="button">X</button></div>' +
      '<div class="m-player-video"><iframe id="m-player-iframe" src="' + fullVimeoSrc(p.vimeoId) +
        '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="m-player-info">' + info + '</div>';

    player.classList.add('open');
    player.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    document.getElementById('m-player-close').addEventListener('click', closePlayer);
  }
  function closePlayer() {
    const player = document.getElementById('m-player');
    player.classList.remove('open');
    player.setAttribute('aria-hidden', 'true');
    player.innerHTML = '';
    document.body.style.overflow = '';
  }

  function openTileContext(pid) {
    const ctx = document.getElementById('m-ctx');
    ctx.style.top = '40%';
    ctx.style.left = '50%';
    ctx.style.transform = 'translate(-50%, -50%)';
    ctx.innerHTML =
      '<div class="m-ctx-item" data-act="open">Open</div>' +
      '<div class="m-ctx-item" data-act="share">Share</div>' +
      '<div class="m-ctx-item" data-act="fav">Add to Favorites</div>';
    ctx.classList.add('open');
    function close() {
      ctx.classList.remove('open');
      document.removeEventListener('click', onDocClick, true);
    }
    function onDocClick(e) {
      if (!ctx.contains(e.target)) close();
    }
    setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
    ctx.querySelectorAll('[data-act]').forEach(function (it) {
      it.addEventListener('click', function () {
        const act = it.dataset.act;
        close();
        if (act === 'open') openPlayer(pid);
        else if (act === 'share') {
          if (navigator.share) navigator.share({ title: 'Rick Wayne, Director', url: location.href });
          else openDialog('Share', '<p>Copy the URL from your browser. Or open Mail. We trust you to figure it out.</p>');
        } else if (act === 'fav') {
          openDialog('Favorites', '<p>Added to Favorites. Just kidding. Favorites is a folder we never made. But the thought was nice.</p>');
        }
      });
    });
  }

  // ---------- Press ----------
  function renderPress() {
    const wrap = document.getElementById('m-press');
    wrap.innerHTML = C.press.map(function (p) {
      return (
        '<a class="m-press-card" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          '<div class="m-press-outlet">' + esc(p.outlet) + '</div>' +
          '<div class="m-press-title">' + esc(p.title) + '</div>' +
          (p.date ? '<div class="m-press-date">' + esc(p.date) + '</div>' : '') +
        '</a>'
      );
    }).join('');
  }

  // ---------- Drawer / wiring ----------
  function wireShell() {
    const burger = document.getElementById('m-burger');
    const drawer = document.getElementById('m-drawer');
    const drawerBg = document.getElementById('m-drawer-bg');
    const close = document.getElementById('m-drawer-close');

    function openDrawer() {
      drawer.classList.add('open');
      drawerBg.classList.add('open');
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      drawerBg.classList.remove('open');
    }
    burger.addEventListener('click', openDrawer);
    drawerBg.addEventListener('click', closeDrawer);
    close.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    // Hero mute toggle
    const heroIframe = document.getElementById('m-hero-iframe');
    const muteBtn = document.getElementById('m-hero-mute');
    let muted = true;
    muteBtn.addEventListener('click', function () {
      muted = !muted;
      // Reload iframe with new params. Vimeo background mode forces mute, so leave background.
      heroIframe.src = 'https://player.vimeo.com/video/' +
        (C.projects.find(p => p.id === 'sharpie-roty') || C.projects[0]).vimeoId +
        '?autoplay=1&loop=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1&muted=' + (muted ? 1 : 0);
      muteBtn.textContent = muted ? 'Tap to unmute' : 'Tap to mute';
    });

    // Desktop swap
    document.getElementById('m-go-desktop').addEventListener('click', function (e) {
      e.preventDefault();
      try { sessionStorage.setItem('view-mode', 'desktop'); } catch (err) {}
      location.reload();
    });

    // Movie Maker open
    document.getElementById('m-mm-open').addEventListener('click', openMovieMaker);

    // Matrix long press -> Properties dialog
    let matrixLP = null;
    const matrix = document.getElementById('m-matrix-tap');
    matrix.addEventListener('touchstart', function () {
      matrixLP = setTimeout(function () {
        openDialog('Properties: matrix.jpg',
          '<p><b>Original photo:</b> ~2003.</p>' +
          '<p><b>Camera:</b> don\'t remember.</p>' +
          '<p><b>People:</b> still my friends.</p>' +
          '<p><b>Made by:</b> Rick.</p>');
      }, 700);
    }, { passive: true });
    matrix.addEventListener('touchend', function () { if (matrixLP) clearTimeout(matrixLP); });
    matrix.addEventListener('touchmove', function () { if (matrixLP) clearTimeout(matrixLP); }, { passive: true });
    matrix.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      openDialog('Properties: matrix.jpg',
        '<p><b>Original photo:</b> ~2003.</p>' +
        '<p><b>Camera:</b> don\'t remember.</p>' +
        '<p><b>People:</b> still my friends.</p>' +
        '<p><b>Made by:</b> Rick.</p>');
    });

    // Tap 1989 three times -> birthday dialog
    const yearEl = document.getElementById('m-year-tap');
    if (yearEl) {
      let n = 0;
      let tmr = null;
      yearEl.addEventListener('click', function () {
        n++;
        if (tmr) clearTimeout(tmr);
        tmr = setTimeout(() => { n = 0; }, 1400);
        if (n >= 3) {
          n = 0;
          openDialog('happy_birthday.bat',
            '<p>1989 was a great year. Tim Berners-Lee proposed the World Wide Web. Game Boy launched. Rick was born.</p>' +
            '<p>The rest is in the work.</p>');
        }
      });
    }

    // Flag 7 taps -> About Rick dialog
    const flagBrand = document.querySelector('[data-flag-tap]');
    if (flagBrand) {
      let taps = 0;
      let ft = null;
      flagBrand.addEventListener('click', function (e) {
        taps++;
        if (ft) clearTimeout(ft);
        ft = setTimeout(() => { taps = 0; }, 1800);
        if (taps >= 7) {
          taps = 0;
          e.preventDefault();
          openDialog('About Rick Wayne',
            '<p style="font-family:var(--m-chrome-font);font-size:18px;margin:0 0 6px">RICK WAYNE</p>' +
            '<p style="font-style:italic;margin:0 0 12px">Director</p>' +
            '<p>' + esc(C.bio.long) + '</p>');
        }
      });
    }

    // Dialog close on bg click
    const dlgBg = document.getElementById('m-dialog-bg');
    dlgBg.addEventListener('click', function (e) {
      if (e.target === dlgBg) closeDialog();
    });
  }

  // ---------- Dialog ----------
  function openDialog(title, bodyHTML) {
    const bg = document.getElementById('m-dialog-bg');
    const dlg = document.getElementById('m-dialog');
    dlg.innerHTML =
      '<div class="m-dialog-title"><span>' + esc(title) + '</span><span style="font-family:var(--m-chrome-font)">X</span></div>' +
      '<div class="m-dialog-body">' + bodyHTML + '</div>' +
      '<div class="m-dialog-buttons"><button type="button" data-close>OK</button></div>';
    dlg.querySelector('[data-close]').addEventListener('click', closeDialog);
    bg.classList.add('open');
  }
  function closeDialog() {
    document.getElementById('m-dialog-bg').classList.remove('open');
  }

  // ---------- Pull to refresh ----------
  function setupPullToRefresh() {
    let startY = null;
    let pulling = false;
    const ptr = document.getElementById('m-ptr');
    window.addEventListener('touchstart', function (e) {
      if (window.scrollY > 4) return;
      startY = e.touches[0].clientY;
      pulling = true;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!pulling || startY == null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 80) {
        ptr.classList.add('show');
        pulling = false;
        setTimeout(function () {
          ptr.classList.remove('show');
        }, 900);
      }
    }, { passive: true });
    window.addEventListener('touchend', function () {
      pulling = false;
      startY = null;
    }, { passive: true });
  }

  // ---------- Movie Maker (camera) ----------
  let mmStream = null;
  let mmRecorder = null;
  let mmChunks = [];
  let mmBlob = null;

  function openMovieMaker() {
    const modal = document.getElementById('m-mm-modal');
    modal.innerHTML =
      '<div class="m-mm-bar"><span>Windows Movie Maker</span><button class="m-drawer-close" id="m-mm-close" type="button">X</button></div>' +
      '<div class="m-mm-video">' +
        '<video id="m-mm-preview" autoplay muted playsinline></video>' +
        '<div class="m-mm-status" id="m-mm-status">Ready</div>' +
      '</div>' +
      '<div class="m-mm-controls">' +
        '<button class="primary" id="m-mm-rec" type="button">Record</button>' +
        '<button id="m-mm-stop" type="button" disabled>Stop</button>' +
        '<button id="m-mm-send" type="button" disabled>Send to Rick</button>' +
      '</div>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    const preview = modal.querySelector('#m-mm-preview');
    const status = modal.querySelector('#m-mm-status');
    const recBtn = modal.querySelector('#m-mm-rec');
    const stopBtn = modal.querySelector('#m-mm-stop');
    const sendBtn = modal.querySelector('#m-mm-send');
    modal.querySelector('#m-mm-close').addEventListener('click', closeMovieMaker);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status.innerHTML = 'No camera support in this browser.';
      recBtn.disabled = true;
      return;
    }
    status.textContent = 'Requesting camera...';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true }).then(function (stream) {
      mmStream = stream;
      preview.srcObject = stream;
      status.textContent = 'Ready. Tap Record.';
    }).catch(function (err) {
      status.textContent = 'Camera not available. (' + (err && err.message ? err.message : 'denied') + ')';
      recBtn.disabled = true;
    });

    recBtn.addEventListener('click', function () {
      if (!mmStream) return;
      mmChunks = [];
      let mime = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm')) mime = 'video/webm';
        else if (MediaRecorder.isTypeSupported('video/mp4')) mime = 'video/mp4';
      } else {
        status.textContent = 'MediaRecorder not supported.';
        return;
      }
      try {
        mmRecorder = new MediaRecorder(mmStream, mime ? { mimeType: mime } : undefined);
      } catch (e) {
        status.textContent = 'Could not start: ' + e.message;
        return;
      }
      mmRecorder.ondataavailable = function (e) { if (e.data && e.data.size) mmChunks.push(e.data); };
      mmRecorder.onstop = function () {
        mmBlob = new Blob(mmChunks, { type: mime || 'video/webm' });
        status.innerHTML = 'Done. Ready to send (' + Math.round(mmBlob.size / 1024) + ' KB)';
        sendBtn.disabled = false;
      };
      mmRecorder.start();
      status.innerHTML = '<span class="m-mm-rec-dot"></span>Recording...';
      recBtn.disabled = true;
      stopBtn.disabled = false;
      sendBtn.disabled = true;
    });

    stopBtn.addEventListener('click', function () {
      if (mmRecorder && mmRecorder.state === 'recording') mmRecorder.stop();
      recBtn.disabled = false;
      stopBtn.disabled = true;
    });

    sendBtn.addEventListener('click', function () {
      if (!mmBlob) return;
      const ext = (mmBlob.type.indexOf('mp4') >= 0) ? 'mp4' : 'webm';
      const url = URL.createObjectURL(mmBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'message-to-rick-' + Date.now() + '.' + ext;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
      // Then mailto
      setTimeout(function () {
        location.href = 'mailto:' + C.bio.email +
          '?subject=' + encodeURIComponent('A Movie Maker message for you') +
          '&body=' + encodeURIComponent('Hi Rick,\n\nI recorded a quick message in Movie Maker on your site. The video downloaded to my device. Attaching it now.\n\n');
      }, 400);
    });
  }
  function closeMovieMaker() {
    const modal = document.getElementById('m-mm-modal');
    if (mmStream) {
      mmStream.getTracks().forEach(function (t) { t.stop(); });
      mmStream = null;
    }
    if (mmRecorder && mmRecorder.state === 'recording') {
      try { mmRecorder.stop(); } catch (e) {}
    }
    mmRecorder = null;
    mmChunks = [];
    mmBlob = null;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '';
  }

  // ---------- Icons ----------
  function igIcon() {
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
  }
  function liIcon() {
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5.5" y="10" width="2" height="8" fill="currentColor"/><rect x="5.5" y="6" width="2" height="2" fill="currentColor"/><path d="M10 10v8M14 13v5M10 13c0-2 4-2.4 4 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  }
  function viIcon() {
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7l5-3 6 14L20 4l1 0v3l-7 14h-3L4 7z" fill="currentColor"/></svg>';
  }

  // ---------- Init ----------
  let initRan = false;
  function init() {
    if (initRan) return;
    root = document.getElementById('mobile-root');
    if (!root) {
      // Body not yet parsed. Try again shortly.
      return;
    }
    initRan = true;
    renderBoot(function () {
      renderShell();
    });
  }

  // Robust ready handling. We're loaded via document.write inside <head>, so
  // we need to wait for the body to exist. Try DOMContentLoaded and a
  // micro-poll fallback in case the event already fired between checks.
  function whenReady(cb) {
    if (document.getElementById('mobile-root')) { cb(); return; }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Body parsed but our root not yet inserted? Should not happen, but poll.
      setTimeout(function () { whenReady(cb); }, 30);
      return;
    }
    document.addEventListener('DOMContentLoaded', cb, { once: true });
    // Belt-and-suspenders: also start a slow poll
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (document.getElementById('mobile-root')) { clearInterval(poll); cb(); }
      else if (attempts > 200) clearInterval(poll);
    }, 30);
  }
  whenReady(init);
})();
