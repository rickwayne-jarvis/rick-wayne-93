/* explorer.js - File Explorer chrome for Work and Press folders */

(function () {
  const RW = window.RW = window.RW || {};
  const Explorer = RW.Explorer = {};
  const ICONS = RW.ICONS;

  // History stack per-window
  function makeChrome(opts) {
    const items = opts.items;
    const title = opts.title;
    const addressPath = opts.path;
    const winId = opts.id;

    if (RW.WM.get(winId)) { RW.WM.bringToFront(winId); return; }

    const wrap = document.createElement('div');
    wrap.className = 'explorer-body';
    wrap.innerHTML =
      '<div class="menu-bar">' +
        '<span class="mb-item"><u>F</u>ile</span>' +
        '<span class="mb-item"><u>E</u>dit</span>' +
        '<span class="mb-item"><u>V</u>iew</span>' +
        '<span class="mb-item"><u>T</u>ools</span>' +
        '<span class="mb-item"><u>H</u>elp</span>' +
      '</div>' +
      '<div class="toolbar">' +
        '<button class="tb-btn" data-act="back" disabled><span class="ico">&lt;-</span>Back</button>' +
        '<button class="tb-btn" data-act="fwd"  disabled><span class="ico">-&gt;</span>Forward</button>' +
        '<button class="tb-btn" data-act="up"><span class="ico">^</span>Up</button>' +
        '<div class="tb-sep"></div>' +
        '<button class="tb-btn" data-act="cut"  disabled><span class="ico">X</span>Cut</button>' +
        '<button class="tb-btn" data-act="copy" disabled><span class="ico">C</span>Copy</button>' +
        '<button class="tb-btn" data-act="paste" disabled><span class="ico">V</span>Paste</button>' +
      '</div>' +
      '<div class="address-bar">' +
        '<label>Address:</label>' +
        '<div class="address-input"><span class="address-path">' + RW.WM.escapeHtml(addressPath) + '</span></div>' +
      '</div>' +
      '<div class="explorer-list"></div>' +
      '<div class="status-bar">' +
        '<div class="sb-cell sb-count">' + items.length + ' object(s)</div>' +
        '<div class="sb-cell">' + (Math.round(items.length * 0.42 * 100) / 100) + ' MB</div>' +
        '<div class="sb-cell" style="margin-left:auto">My Computer</div>' +
      '</div>';

    const w = RW.WM.open({
      id: winId,
      title: title,
      icon: ICONS.folder,
      width: 560, height: 380,
      contentNode: wrap
    });
    // Make body padding 0 so chrome sits flush
    w.body.style.padding = '0';

    const list = wrap.querySelector('.explorer-list');
    items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'explorer-item';
      el.dataset.id = it.id || '';
      const iconHTML = it.iconHTML || (it.icon ? it.icon : ICONS.video);
      el.innerHTML = '<div class="icon-img">' + iconHTML + '</div><div class="label">' + RW.WM.escapeHtml(it.label) + '</div>';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        list.querySelectorAll('.explorer-item.selected').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        if (RW.Audio) RW.Audio.click();
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (RW.Audio) RW.Audio.dblclick();
        if (it.action) it.action();
      });
      list.appendChild(el);
    });

    // Toolbar buttons that do something
    wrap.querySelector('[data-act=up]').addEventListener('click', () => {
      // close window to "go up"
      RW.WM.close(winId);
    });
  }

  Explorer.openWork = function () {
    const items = RW.projects.map(p => ({
      id: p.id,
      label: p.filename,
      iconHTML: ICONS.video,
      action: () => RW.WMP.openProject(p.id)
    }));
    makeChrome({
      id: 'explorer-work',
      title: 'Work',
      path: 'C:\\Work',
      items: items
    });
    // Track in Documents recents
    RW.StartMenu && RW.StartMenu.touchDocument('Work');
  };

  Explorer.openPress = function () {
    const items = RW.press.map((p, i) => ({
      id: 'press-' + i,
      label: p.outlet + ' - ' + (p.date || ''),
      iconHTML: faviconIcon(p.domain),
      action: () => {
        window.open(p.url, '_blank', 'noopener');
        if (RW.Audio) RW.Audio.ding();
      }
    }));
    makeChrome({
      id: 'explorer-press',
      title: 'Press',
      path: 'C:\\Press',
      items: items
    });
    RW.StartMenu && RW.StartMenu.touchDocument('Press');
  };

  function faviconIcon(domain) {
    if (!domain) return RW.ICONS.shortcut;
    const url = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=32';
    return '<div style="position:relative;width:32px;height:32px">' +
      '<img class="favicon" src="' + url + '" onerror="this.style.display=\'none\'; this.nextSibling.style.display=\'block\'" />' +
      '<div style="display:none">' + RW.ICONS.shortcut + '</div>' +
      '<div style="position:absolute;left:-2px;bottom:-2px;width:14px;height:14px;background:#fff;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:\'W95FA\',sans-serif;font-weight:bold;color:#000">&#x21B3;</div>' +
      '</div>';
  }
})();
