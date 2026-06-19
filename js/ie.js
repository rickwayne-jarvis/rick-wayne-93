/* ie.js - Win95 Internet Explorer 4 shell. Hosts arbitrary page content. */

(function () {
  const RW = window.RW = window.RW || {};
  const IE = RW.IE = {};

  // Shared icon (also used for shortcut overlay)
  const ieIcon = function () {
    return '<svg viewBox="0 0 32 32" width="32" height="32">' +
      // page
      '<circle cx="16" cy="16" r="11" fill="#003399" stroke="#000"/>' +
      '<ellipse cx="16" cy="16" rx="11" ry="4" fill="none" stroke="#fff" stroke-width="0.8"/>' +
      '<ellipse cx="16" cy="16" rx="4" ry="11" fill="none" stroke="#fff" stroke-width="0.8"/>' +
      '<text x="16" y="20" font-family="serif" font-weight="bold" font-size="14" text-anchor="middle" fill="#ffcc00">e</text>' +
      '</svg>';
  };
  IE.icon = ieIcon;

  IE.openURL = function (opts) {
    opts = opts || {};
    const id = opts.id || ('ie_' + Math.random().toString(36).slice(2, 8));
    if (RW.WM.get(id)) { RW.WM.bringToFront(id); return RW.WM.get(id); }

    const url = opts.url || 'http://example.com/';
    const title = opts.title || (opts.url || 'Internet Explorer');

    const wrap = document.createElement('div');
    wrap.className = 'ie-body';
    wrap.innerHTML = ieChromeHTML(url);

    const w = RW.WM.open({
      id: id,
      title: title + ' - Microsoft Internet Explorer',
      icon: ieIcon(),
      width: opts.width || 820,
      height: opts.height || 600,
      contentNode: wrap,
      onClose: opts.onClose
    });
    w.body.style.padding = '0';
    w.body.style.background = '#c0c0c0';

    // Address bar
    const addrInput = wrap.querySelector('.ie-addr-input');
    addrInput.value = url;
    addrInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // gag: pretend to navigate but bounce back
        const val = addrInput.value;
        showGagNav(wrap, val);
      }
    });

    // Mount custom content
    const content = wrap.querySelector('.ie-content');
    if (opts.contentNode) content.appendChild(opts.contentNode);
    if (opts.contentHTML) content.innerHTML = opts.contentHTML;

    // Back / forward / stop / refresh gags
    wrap.querySelectorAll('.ie-toolbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (RW.Audio) RW.Audio.click();
      });
    });

    return w;
  };

  function showGagNav(wrap, val) {
    const status = wrap.querySelector('.ie-status-text');
    if (!status) return;
    const orig = status.textContent;
    status.textContent = 'Opening page ' + val + ' ...';
    setTimeout(() => {
      status.textContent = orig || 'Done';
    }, 1400);
  }

  function ieChromeHTML(url) {
    return (
      '<div class="ie-menubar">' +
        '<span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span>' +
      '</div>' +
      '<div class="ie-toolbar">' +
        '<button class="ie-toolbtn"><span class="ie-tb-arr">&larr;</span><span>Back</span></button>' +
        '<button class="ie-toolbtn"><span class="ie-tb-arr">&rarr;</span><span>Forward</span></button>' +
        '<button class="ie-toolbtn">&#10006; Stop</button>' +
        '<button class="ie-toolbtn">&#x21BA; Refresh</button>' +
        '<button class="ie-toolbtn">Home</button>' +
        '<div class="ie-tb-sep"></div>' +
        '<button class="ie-toolbtn">Search</button>' +
        '<button class="ie-toolbtn">Favorites</button>' +
        '<button class="ie-toolbtn">History</button>' +
        '<button class="ie-toolbtn">Print</button>' +
        '<div class="ie-spin"><div class="ie-spin-e">e</div></div>' +
      '</div>' +
      '<div class="ie-addrbar">' +
        '<span class="ie-addr-label">Address:</span>' +
        '<input class="ie-addr-input" type="text" value="' + escapeAttr(url) + '">' +
        '<button class="ie-toolbtn ie-addr-go">Go</button>' +
        '<button class="ie-toolbtn">Links</button>' +
      '</div>' +
      '<div class="ie-content"></div>' +
      '<div class="ie-statusbar">' +
        '<div class="ie-status-text">Done</div>' +
        '<div class="ie-status-zone">Internet</div>' +
      '</div>'
    );
  }

  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  // ===== Geocities homepage (v4) =====
  function rainbowTitle(text) {
    const colors = ['#ff0000','#ff7f00','#e0c000','#00aa00','#0066ff','#7a00cc','#cc00aa'];
    let out = '';
    [...text].forEach((ch, i) => {
      if (ch === ' ') { out += '&nbsp;'; return; }
      out += '<span style="color:' + colors[i % colors.length] + '">' + escapeAttr(ch) + '</span>';
    });
    return out;
  }

  function geocitiesHTML() {
    const counter = '000142'.split('').map(d => '<span class="geo-digit">' + d + '</span>').join('');
    return '' +
      '<div class="geo-page">' +
        '<div class="geo-marquee"><div class="geo-marquee-inner">WELCOME TO RICK WAYNE\'S HOMEPAGE * BEST VIEWED IN NETSCAPE NAVIGATOR 3.0 * 800x600 RESOLUTION * 256 COLORS</div></div>' +
        '<h1 class="geo-title">' + rainbowTitle("RICK WAYNE'S HOMEPAGE") + '</h1>' +
        '<div class="geo-uc">' +
          '<svg viewBox="0 0 80 60" width="80" height="60">' +
            '<polygon points="40,4 76,56 4,56" fill="#ffd000" stroke="#000" stroke-width="2"/>' +
            '<circle cx="40" cy="34" r="6" fill="#ffd9b3" stroke="#000"/>' +
            '<rect x="34" y="40" width="12" height="10" fill="#0066cc" stroke="#000"/>' +
            '<line x1="46" y1="44" x2="62" y2="28" stroke="#000" stroke-width="2"/>' +
            '<rect x="58" y="22" width="6" height="6" fill="#888" stroke="#000"/>' +
            '<rect x="34" y="28" width="12" height="3" fill="#ffd000" stroke="#000"/>' +
          '</svg>' +
          '<span class="geo-blink">UNDER CONSTRUCTION!!!</span>' +
        '</div>' +
        '<p class="geo-about">Welcome to my web page!!! My name is Rick and I am 14 years old. I live in the U.S.A. with my parents and my dog. My hobbies are making movies on the computer, basketball, and the X Files. When I grow up I want to direct movies for real. Sign my guest book!!!</p>' +
        '<p class="geo-counter">You are visitor #<span class="geo-counter-box">' + counter + '</span></p>' +
        '<h2 class="geo-h2">My Favorite Links</h2>' +
        '<ul class="geo-links">' +
          '<li><span class="geo-link-broken">My friend Mike\'s page (he\'s Neo)</span></li>' +
          '<li><span class="geo-link-broken">The Coolest Movie Ever (offline since 1998)</span></li>' +
          '<li><span class="geo-link-broken">How to Make A Movie in Movie Maker</span></li>' +
        '</ul>' +
        '<p class="geo-guest"><a class="geo-guest-link" href="mailto:rick_wayne@me.com?subject=Guest%20book%20entry">Sign my guest book!</a></p>' +
        '<hr class="geo-hr">' +
        '<p class="geo-foot">(c) 1995 Rick Wayne. Made with Notepad. All rights reserved.</p>' +
      '</div>';
  }

  IE.open = function () {
    if (RW.WM.get('ie-geocities')) { RW.WM.bringToFront('ie-geocities'); return; }
    return IE.openURL({
      id: 'ie-geocities',
      url: 'geocities.com/rick-wayne-1995',
      title: 'Geocities.com/rick-wayne-1995',
      width: 700, height: 560,
      contentHTML: geocitiesHTML()
    });
  };
})();
