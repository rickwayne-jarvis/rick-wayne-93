/* wmp.js - Windows Media Player wrapper around a Vimeo iframe */

(function () {
  const RW = window.RW = window.RW || {};
  const WMP = RW.WMP = {};
  const ICONS = RW.ICONS;

  // index of project ids for next/prev
  let playerStates = {}; // winId -> state

  function escHtml(s) { return RW.WM.escapeHtml(s); }

  WMP.openProject = function (projectId) {
    const idx = RW.projects.findIndex(p => p.id === projectId);
    if (idx < 0) return;
    const project = RW.projects[idx];
    const winId = 'wmp-' + project.id;

    if (RW.WM.get(winId)) {
      RW.WM.bringToFront(winId);
      return;
    }

    const playerId = 'wmp-frame-' + project.id;
    const vimeoSrc = 'https://player.vimeo.com/video/' + project.vimeoId +
      '?title=0&byline=0&portrait=0&dnt=1&api=1&player_id=' + encodeURIComponent(playerId);

    const wrap = document.createElement('div');
    wrap.className = 'wmp-body';

    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item" data-menu="file"><u>F</u>ile' +
          '<div class="mb-sub">' +
            '<div data-act="open">Open...</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="play"><u>P</u>lay' +
          '<div class="mb-sub">' +
            '<div data-act="play">Play</div>' +
            '<div data-act="pause">Pause</div>' +
            '<div data-act="stop">Stop</div>' +
            '<div class="mb-sep"></div>' +
            '<div data-act="prev">Previous</div>' +
            '<div data-act="next">Next</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="view"><u>V</u>iew' +
          '<div class="mb-sub">' +
            '<div data-act="info">Now Playing / Info</div>' +
            '<div data-act="full">Full Screen</div>' +
          '</div>' +
        '</span>' +
        '<span class="mb-item" data-menu="help"><u>H</u>elp' +
          '<div class="mb-sub">' +
            '<div data-act="about">About Windows Media Player</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="wmp-main">' +
        '<div class="wmp-video">' +
          '<iframe id="' + playerId + '" allow="autoplay; fullscreen; picture-in-picture" src="' + vimeoSrc + '"></iframe>' +
        '</div>' +
        infoPaneHTML(project) +
      '</div>' +
      '<div class="wmp-controls">' +
        '<div class="wmp-seek">' +
          '<input type="range" min="0" max="1000" value="0" data-act="seek" />' +
          '<div class="time"><span data-cur>0:00</span> / <span data-dur>0:00</span></div>' +
        '</div>' +
        '<div class="wmp-transport">' +
          '<button data-t="play"   title="Play">&#9654;</button>' +
          '<button data-t="pause"  title="Pause">&#10074;&#10074;</button>' +
          '<button data-t="stop"   title="Stop">&#9632;</button>' +
          '<button data-t="prev"   title="Previous">|&#9664;</button>' +
          '<button data-t="next"   title="Next">&#9654;|</button>' +
          '<div class="gap"></div>' +
          '<div class="wmp-volume"><span>Vol</span><input type="range" min="0" max="100" value="60" data-t="vol" /></div>' +
        '</div>' +
      '</div>' +
      '<div class="wmp-status"><div class="sb-cell" data-status>Ready</div><div class="sb-cell" data-clip>' + escHtml(project.filename) + '</div></div>';

    const w = RW.WM.open({
      id: winId,
      title: 'Windows Media Player - ' + project.filename,
      icon: ICONS.video,
      width: project.built && project.scoreboard ? 880 : 640,
      height: 520,
      contentNode: wrap,
      onClose: () => { delete playerStates[winId]; }
    });
    w.body.style.padding = '0';

    const iframe = wrap.querySelector('iframe');
    const statusCell = wrap.querySelector('[data-status]');
    const curEl = wrap.querySelector('[data-cur]');
    const durEl = wrap.querySelector('[data-dur]');
    const seekEl = wrap.querySelector('[data-act=seek]');
    const volEl = wrap.querySelector('[data-t=vol]');
    const info = wrap.querySelector('.wmp-info');

    const state = {
      duration: 0, current: 0, playing: false, ready: false,
      iframe: iframe, playerId: playerId
    };
    playerStates[winId] = state;

    function postVimeo(method, value) {
      try {
        const msg = value !== undefined ? { method: method, value: value } : { method: method };
        iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
      } catch (e) {}
    }

    function setStatus(s) { statusCell.textContent = s; }

    function play()  { postVimeo('play');  setStatus('Playing'); }
    function pause() { postVimeo('pause'); setStatus('Paused'); }
    function stop()  { postVimeo('pause'); postVimeo('setCurrentTime', 0); setStatus('Stopped'); }
    function setVol(v) { postVimeo('setVolume', v / 100); }
    function seekTo(s) { postVimeo('setCurrentTime', s); }

    function fmt(t) {
      t = Math.max(0, Math.floor(t || 0));
      const m = Math.floor(t / 60), s = t % 60;
      return m + ':' + String(s).padStart(2, '0');
    }

    function onVimeoMessage(e) {
      let data; try { data = (typeof e.data === 'string') ? JSON.parse(e.data) : e.data; } catch (err) { return; }
      if (!data || data.player_id !== playerId) return;
      if (data.event === 'ready') {
        state.ready = true;
        // subscribe
        postVimeo('addEventListener', 'play');
        postVimeo('addEventListener', 'pause');
        postVimeo('addEventListener', 'finish');
        postVimeo('addEventListener', 'playProgress');
        postVimeo('addEventListener', 'loadProgress');
        postVimeo('getDuration');
        setStatus('Ready');
        setVol(volEl.value);
      } else if (data.event === 'play') {
        state.playing = true; setStatus('Playing');
      } else if (data.event === 'pause') {
        state.playing = false; setStatus('Paused');
      } else if (data.event === 'finish') {
        state.playing = false; setStatus('Stopped');
      } else if (data.event === 'playProgress') {
        const d = data.data || {};
        if (d.duration && !state.duration) { state.duration = d.duration; durEl.textContent = fmt(d.duration); }
        state.current = d.seconds || 0;
        curEl.textContent = fmt(state.current);
        if (state.duration) {
          seekEl.value = Math.round((state.current / state.duration) * 1000);
        }
      } else if (data.method === 'getDuration' || data.event === 'getDuration') {
        if (typeof data.value === 'number') { state.duration = data.value; durEl.textContent = fmt(data.value); }
      }
    }
    window.addEventListener('message', onVimeoMessage);
    const prevClose = w.onClose;
    w.onClose = function () {
      window.removeEventListener('message', onVimeoMessage);
      if (prevClose) prevClose();
    };

    // Wire transport buttons
    wrap.querySelectorAll('[data-t]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.t;
        if (t === 'play') play();
        else if (t === 'pause') pause();
        else if (t === 'stop') stop();
        else if (t === 'prev') gotoOffset(-1);
        else if (t === 'next') gotoOffset(1);
        if (RW.Audio) RW.Audio.click();
      });
    });
    volEl.addEventListener('input', () => setVol(volEl.value));

    seekEl.addEventListener('input', () => {
      if (!state.duration) return;
      const s = (seekEl.value / 1000) * state.duration;
      seekTo(s);
    });

    // Menus
    wrap.querySelectorAll('.menu-bar .mb-item').forEach(mb => {
      mb.addEventListener('click', (e) => {
        wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => { if (x !== mb) x.classList.remove('open'); });
        mb.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => x.classList.remove('open'));
    });
    wrap.querySelectorAll('.menu-bar .mb-sub div').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = d.dataset.act;
        wrap.querySelectorAll('.menu-bar .mb-item').forEach(x => x.classList.remove('open'));
        if (act === 'play') play();
        else if (act === 'pause') pause();
        else if (act === 'stop') stop();
        else if (act === 'prev') gotoOffset(-1);
        else if (act === 'next') gotoOffset(1);
        else if (act === 'exit') RW.WM.close(winId);
        else if (act === 'open') RW.Explorer.openWork();
        else if (act === 'info') { if (info) info.classList.toggle('hidden'); }
        else if (act === 'full') {
          try { iframe.requestFullscreen && iframe.requestFullscreen(); } catch (e) {}
        }
        else if (act === 'about') openAbout();
      });
    });

    function gotoOffset(off) {
      const ids = RW.projects.map(p => p.id);
      let cur = ids.indexOf(project.id);
      let next = (cur + off + ids.length) % ids.length;
      RW.WM.close(winId);
      setTimeout(() => WMP.openProject(ids[next]), 100);
    }

    function openAbout() {
      const html = '<div class="about-wmp"><h2>Windows Media Player</h2>' +
        '<p>Version 6.4 (Rick Wayne edition)</p>' +
        '<p>(c) 1996-2026 Rick Wayne. Built on postMessage and one extra cup of coffee.</p>' +
        '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
      const aw = RW.WM.open({
        title: 'About Windows Media Player', icon: ICONS.video,
        width: 360, height: 200, resizable: false, contentHTML: html
      });
      aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
    }

    // Track in start menu Documents
    RW.StartMenu && RW.StartMenu.touchDocument(project.filename);
  };

  function infoPaneHTML(p) {
    if (!p.built && !p.scoreboard) {
      return '<aside class="wmp-info">' +
        '<h3>' + escHtml(p.title) + '</h3>' +
        '<div class="meta"><b>Client:</b> ' + escHtml(p.client || '') + '</div>' +
        '<div class="meta"><b>Year:</b> ' + escHtml(p.year || '') + '</div>' +
        '<div class="meta"><b>Role:</b> ' + escHtml(p.role || '') + '</div>' +
        '<div class="copy">' + escHtml(p.copy || '') + '</div>' +
        '<div class="meta" style="margin-top:8px;color:#606060">Full case study in development.</div>' +
        '</aside>';
    }
    let html = '<aside class="wmp-info">' +
      '<h3>' + escHtml(p.title) + '</h3>';
    if (p.tagline) html += '<div class="meta" style="font-style:italic">' + escHtml(p.tagline) + '</div>';
    html += '<div class="meta"><b>Client:</b> ' + escHtml(p.client || '') + '</div>';
    if (p.agency) html += '<div class="meta"><b>Agency:</b> ' + escHtml(p.agency) + '</div>';
    html += '<div class="meta"><b>Year:</b> ' + escHtml(p.year || '') + '</div>';
    html += '<div class="meta"><b>Role:</b> ' + escHtml(p.role || '') + '</div>';
    if (p.copy) html += '<div class="copy">' + escHtml(p.copy) + '</div>';
    if (p.scoreboard && p.scoreboard.length) {
      html += '<div style="margin:8px 0 2px"><b>Scoreboard</b></div><div class="wmp-scoreboard">';
      p.scoreboard.forEach(t => {
        html += '<div class="tile"><div class="val">' + escHtml(t.value) + '</div><div class="lbl">' + escHtml(t.label) + '</div></div>';
      });
      html += '</div>';
    }
    html += '</aside>';
    return html;
  }
})();
