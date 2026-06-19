/* moviemaker.js - Windows Movie Maker rebuild with real camera recording */

(function () {
  const RW = window.RW = window.RW || {};
  const MM = RW.MovieMaker = {};
  const ICONS = RW.ICONS;
  const ID = 'movie-maker';

  MM.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    if (window.innerWidth < 768) {
      openMobileNotice();
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'mm-body';
    wrap.innerHTML = buildShellHTML();

    const w = RW.WM.open({
      id: ID,
      title: 'Windows Movie Maker',
      icon: ICONS.video,
      width: 580, height: 480,
      contentNode: wrap,
      onClose: () => stopAll()
    });
    w.body.style.padding = '0';

    // State
    const state = {
      stream: null,
      recorder: null,
      chunks: [],
      recording: false,
      blob: null,
      blobURL: null,
      startTime: 0,
      tickerId: null,
      menuOpen: null
    };

    // Refs
    const statusEl   = wrap.querySelector('[data-status]');
    const previewEl  = wrap.querySelector('[data-preview]');
    const recBtn     = wrap.querySelector('[data-rec]');
    const recDot     = wrap.querySelector('[data-recdot]');
    const elapsedEl  = wrap.querySelector('[data-elapsed]');
    const sendBtn    = wrap.querySelector('[data-send]');
    const reBtn      = wrap.querySelector('[data-re]');

    function setStatus(txt) { statusEl.textContent = txt; }
    function setRecDot(on) { recDot.style.visibility = on ? 'visible' : 'hidden'; }
    function fmtElapsed(ms) {
      const t = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(t / 60);
      const s = t % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // ===== Camera =====
    function showError(msg, allowRetry) {
      previewEl.innerHTML = '';
      const panel = document.createElement('div');
      panel.className = 'mm-error';
      panel.innerHTML =
        '<div class="mm-error-icon"><svg viewBox="0 0 32 32" width="36" height="36">' +
          '<circle cx="16" cy="16" r="13" fill="#c8102e" stroke="#000"/>' +
          '<path d="M9 9 L23 23 M23 9 L9 23" stroke="#fff" stroke-width="3" fill="none"/>' +
        '</svg></div>' +
        '<div class="mm-error-text">' + RW.WM.escapeHtml(msg) + '</div>' +
        (allowRetry ? '<button data-retry class="mm-btn">Retry</button>' : '');
      previewEl.appendChild(panel);
      if (allowRetry) {
        panel.querySelector('[data-retry]').addEventListener('click', () => requestCamera());
      }
      setStatus('Camera unavailable.');
      if (RW.Audio) RW.Audio.error();
    }

    function showLivePreview() {
      previewEl.innerHTML = '';
      const v = document.createElement('video');
      v.autoplay = true;
      v.muted = true;
      v.playsInline = true;
      v.className = 'mm-video';
      v.srcObject = state.stream;
      previewEl.appendChild(v);
    }

    function showRecordedPreview() {
      previewEl.innerHTML = '';
      const v = document.createElement('video');
      v.controls = true;
      v.src = state.blobURL;
      v.className = 'mm-video';
      previewEl.appendChild(v);
    }

    function requestCamera() {
      setStatus('Requesting camera...');
      previewEl.innerHTML = '<div class="mm-loading">Requesting camera...</div>';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Movie Maker needs your camera to record. This browser does not expose getUserMedia.', false);
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          state.stream = stream;
          showLivePreview();
          setStatus('Ready to record.');
          recBtn.disabled = false;
        })
        .catch(err => {
          const name = (err && err.name) || '';
          if (name === 'NotAllowedError' || name === 'SecurityError') {
            showError('Movie Maker needs your camera to record. Check browser permissions and try again.', true);
          } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
            showError('No camera was found on this system. Connect a camera and try again.', true);
          } else if (name === 'NotReadableError') {
            showError('The camera is in use by another application. Close it and try again.', true);
          } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            showError('Permission required. Open this site in its own tab over HTTPS to record.', true);
          } else {
            showError('Movie Maker could not access the camera. ' + (err && err.message ? err.message : ''), true);
          }
        });
    }

    function stopAll() {
      if (state.tickerId) { clearInterval(state.tickerId); state.tickerId = null; }
      if (state.recorder && state.recording) {
        try { state.recorder.stop(); } catch (e) {}
      }
      state.recording = false;
      if (state.stream) {
        state.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
        state.stream = null;
      }
      if (state.blobURL) {
        try { URL.revokeObjectURL(state.blobURL); } catch (e) {}
        state.blobURL = null;
      }
    }

    function pickMime() {
      const candidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      if (typeof MediaRecorder === 'undefined') return null;
      for (const t of candidates) {
        try { if (MediaRecorder.isTypeSupported(t)) return t; } catch (e) {}
      }
      return '';
    }

    function startRecord() {
      if (!state.stream) return;
      if (typeof MediaRecorder === 'undefined') {
        showError('MediaRecorder is not supported in this browser.', false);
        return;
      }
      const mime = pickMime();
      let recorder;
      try {
        recorder = mime ? new MediaRecorder(state.stream, { mimeType: mime }) : new MediaRecorder(state.stream);
      } catch (e) {
        showError('Could not start recording: ' + e.message, true);
        return;
      }
      state.chunks = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) state.chunks.push(e.data); };
      recorder.onstop = () => {
        const type = mime || 'video/webm';
        state.blob = new Blob(state.chunks, { type: type });
        if (state.blobURL) { try { URL.revokeObjectURL(state.blobURL); } catch (e) {} }
        state.blobURL = URL.createObjectURL(state.blob);
        showRecordedPreview();
        setStatus('Recorded. Play it back, then send.');
        sendBtn.disabled = false;
        reBtn.disabled = false;
        recBtn.textContent = 'REC';
        setRecDot(false);
      };
      state.recorder = recorder;
      state.recording = true;
      recorder.start();
      state.startTime = Date.now();
      setStatus('Recording...');
      recBtn.textContent = 'Stop';
      setRecDot(true);
      sendBtn.disabled = true;
      reBtn.disabled = true;
      if (state.tickerId) clearInterval(state.tickerId);
      state.tickerId = setInterval(() => {
        elapsedEl.textContent = fmtElapsed(Date.now() - state.startTime);
      }, 250);
    }

    function stopRecord() {
      if (!state.recorder || !state.recording) return;
      state.recording = false;
      try { state.recorder.stop(); } catch (e) {}
      if (state.tickerId) { clearInterval(state.tickerId); state.tickerId = null; }
    }

    function resetToLive() {
      if (state.blobURL) { try { URL.revokeObjectURL(state.blobURL); } catch (e) {} state.blobURL = null; }
      state.blob = null;
      state.chunks = [];
      elapsedEl.textContent = '00:00';
      sendBtn.disabled = true;
      reBtn.disabled = true;
      recBtn.disabled = !state.stream;
      recBtn.textContent = 'REC';
      setRecDot(false);
      if (state.stream) {
        showLivePreview();
        setStatus('Ready to record.');
      } else {
        requestCamera();
      }
    }

    // ===== REC button =====
    recBtn.addEventListener('click', () => {
      if (state.recording) stopRecord();
      else startRecord();
      if (RW.Audio) RW.Audio.click();
    });
    reBtn.addEventListener('click', () => {
      resetToLive();
      if (RW.Audio) RW.Audio.click();
    });
    sendBtn.addEventListener('click', () => {
      if (!state.blob || !state.blobURL) return;
      openSendDialog();
    });

    // ===== Menus =====
    function closeMenus() {
      wrap.querySelectorAll('.mm-menubar .mm-menu').forEach(m => m.classList.remove('open'));
      state.menuOpen = null;
    }
    wrap.querySelectorAll('.mm-menubar .mm-menu').forEach(m => {
      m.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = m.classList.contains('open');
        closeMenus();
        if (!wasOpen) { m.classList.add('open'); state.menuOpen = m; }
      });
    });
    document.addEventListener('click', () => closeMenus());

    wrap.querySelectorAll('.mm-menubar .mm-sub div[data-mact]').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = d.dataset.mact;
        closeMenus();
        if (act === 'new') resetToLive();
        else if (act === 'save') {
          if (state.blob && state.blobURL) {
            downloadCurrent();
          } else {
            simpleDialog('Save Movie', 'Nothing to save yet.');
          }
        }
        else if (act === 'exit') RW.WM.close(ID);
        else if (act === 'about') {
          simpleDialog('About Movie Maker', 'Windows Movie Maker (rebuilt for the web). The very app I cut my first home movies in. Send me one back.');
        }
      });
    });

    function downloadCurrent() {
      if (!state.blob || !state.blobURL) return;
      const a = document.createElement('a');
      a.href = state.blobURL;
      a.download = 'message-to-rick-' + timestamp() + '.webm';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    function timestamp() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
        pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }

    function openSendDialog() {
      const html =
        '<div class="dialog-body">' +
          '<p><b>Send your message to Rick</b></p>' +
          '<p>Your video lives in your browser. Choose how to send it.</p>' +
          '<p style="font-size:11px;color:#444">Download the file, then attach it in the email that opens.</p>' +
        '</div>' +
        '<div class="dialog-buttons">' +
          '<button data-act="dl-email">Download and email</button>' +
          '<button data-act="dl">Download only</button>' +
          '<button data-act="cancel">Cancel</button>' +
        '</div>';
      const dw = RW.WM.open({
        title: 'Send to Rick', icon: ICONS.video,
        width: 420, height: 200, resizable: false, contentHTML: html
      });
      dw.body.querySelectorAll('button[data-act]').forEach(b => {
        b.addEventListener('click', () => {
          const act = b.dataset.act;
          if (act === 'dl-email') {
            downloadCurrent();
            RW.WM.close(dw.id);
            setTimeout(() => {
              window.location.href = 'mailto:rick_wayne@me.com?subject=A%20message%20for%20Rick&body=Hi%20Rick%2C%20I%20recorded%20you%20a%20video%20through%20your%20site.%20Attached.';
            }, 300);
          } else if (act === 'dl') {
            downloadCurrent();
            RW.WM.close(dw.id);
          } else {
            RW.WM.close(dw.id);
          }
        });
      });
    }

    // Boot the camera
    requestCamera();
  };

  function simpleDialog(title, body) {
    const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(body) + '</p></div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const aw = RW.WM.open({
      title: title, icon: RW.ICONS.video,
      width: 380, height: 180, resizable: false, contentHTML: html
    });
    aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
  }

  function openMobileNotice() {
    const html = '<div class="dialog-body"><p>Movie Maker is desktop-only. Open this site on a larger screen to record.</p></div>' +
      '<div class="dialog-buttons"><button data-close>OK</button></div>';
    const aw = RW.WM.open({
      title: 'Windows Movie Maker', icon: RW.ICONS.video,
      width: 400, height: 180, resizable: false, contentHTML: html
    });
    aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
  }

  function buildShellHTML() {
    return '' +
      '<div class="mm-menubar">' +
        '<span class="mm-menu" data-menu="file"><u>F</u>ile' +
          '<div class="mm-sub">' +
            '<div data-mact="new">New</div>' +
            '<div data-mact="save">Save Movie...</div>' +
            '<div class="mm-sep"></div>' +
            '<div data-mact="exit">Exit</div>' +
          '</div>' +
        '</span>' +
        '<span class="mm-menu" data-menu="help"><u>H</u>elp' +
          '<div class="mm-sub">' +
            '<div data-mact="about">About Movie Maker</div>' +
          '</div>' +
        '</span>' +
      '</div>' +
      '<div class="mm-status-row"><div class="mm-status" data-status>Ready</div></div>' +
      '<div class="mm-preview filmstrip" data-preview></div>' +
      '<div class="mm-controls">' +
        '<button class="mm-btn mm-rec" data-rec disabled>REC</button>' +
        '<div class="mm-recdot-wrap"><span class="mm-recdot" data-recdot style="visibility:hidden"></span></div>' +
        '<div class="mm-elapsed" data-elapsed>00:00</div>' +
        '<div class="mm-spacer"></div>' +
        '<button class="mm-btn" data-re disabled>Re-record</button>' +
        '<button class="mm-btn mm-send" data-send disabled>Send to Rick</button>' +
      '</div>';
  }
})();
