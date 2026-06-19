/* contextmenu.js - right-click menus */

(function () {
  const RW = window.RW = window.RW || {};
  const CM = RW.ContextMenu = {};
  const menuEl = () => document.getElementById('context-menu');

  function hide() {
    const el = menuEl();
    el.hidden = true;
    el.innerHTML = '';
  }
  CM.hide = hide;

  function show(x, y, items) {
    const el = menuEl();
    el.innerHTML = '';
    const ul = document.createElement('ul');
    items.forEach(item => {
      if (item.sep) { const li = document.createElement('li'); li.className = 'sep'; ul.appendChild(li); return; }
      const li = document.createElement('li');
      if (item.disabled) li.classList.add('disabled');
      li.textContent = item.label;
      if (item.sub) {
        li.classList.add('has-sub');
        const sub = document.createElement('ul');
        sub.className = 'sub-menu';
        item.sub.forEach(s => {
          const sl = document.createElement('li');
          if (s.disabled) sl.classList.add('disabled');
          sl.textContent = s.label;
          if (s.action && !s.disabled) {
            sl.addEventListener('click', (e) => { e.stopPropagation(); hide(); s.action(); });
          }
          sub.appendChild(sl);
        });
        li.appendChild(sub);
      } else if (item.action && !item.disabled) {
        li.addEventListener('click', (e) => { e.stopPropagation(); hide(); item.action(); });
      }
      ul.appendChild(li);
    });
    el.appendChild(ul);
    el.style.left = Math.min(window.innerWidth - 200, x) + 'px';
    el.style.top  = Math.min(window.innerHeight - 200, y) + 'px';
    el.hidden = false;
  }
  CM.show = show;

  document.addEventListener('click', hide);
  document.addEventListener('contextmenu', (e) => {
    const icon = e.target.closest('.desktop-icon');
    const desk = e.target.closest('#desktop-surface');
    if (!desk) return;
    e.preventDefault();
    if (icon) {
      const id = icon.dataset.iconId;
      show(e.clientX, e.clientY, [
        { label: 'Open', action: () => icon.dispatchEvent(new Event('dblclick', { bubbles: true })) },
        { label: 'Send To', sub: [
          { label: 'Treatment Folder',  action: () => alert('Treatment saved. Not really.') },
          { label: 'Pitch Deck Drive',  action: () => alert('Pitched. Probably booked.') },
          { label: 'Reel, Eventually', action: () => alert('Uploading. ETA: 4 hours.') }
        ]},
        { sep: true },
        { label: 'Cut',   disabled: true },
        { label: 'Copy',  disabled: true },
        { sep: true },
        { label: 'Create Shortcut', action: () => alert('Shortcut created on desktop. (it has not)') },
        { label: 'Delete',          action: () => alert('Cannot delete. This icon is load-bearing.') },
        { label: 'Rename',          action: () => RW.Easter.rename() },
        { sep: true },
        { label: 'Properties',      action: () => alert('Properties of ' + (icon.querySelector('.icon-label').textContent) + ': director-grade.') }
      ]);
    } else if (e.target.closest('.window')) {
      // do nothing inside windows
      return;
    } else {
      // empty desktop
      show(e.clientX, e.clientY, [
        { label: 'Arrange Icons by', sub: [
          { label: 'Name', action: () => alert('Already arranged. Trust the curator.') },
          { label: 'Type', action: () => alert('Already arranged.') },
          { label: 'Size', action: () => alert('Already arranged.') },
          { label: 'Date', action: () => alert('Already arranged.') }
        ]},
        { label: 'Line up Icons',    action: () => alert('Lined up.') },
        { sep: true },
        { label: 'Refresh',          action: () => { if (RW.Audio) RW.Audio.click(); } },
        { sep: true },
        { label: 'Send Rick a postcard', action: () => RW.MovieMaker && RW.MovieMaker.open() },
        { sep: true },
        { label: 'Paste',         disabled: true },
        { label: 'Paste Shortcut',disabled: true },
        { sep: true },
        { label: 'New', sub: [
          { label: 'Folder',       disabled: true },
          { label: 'Shortcut',     disabled: true },
          { label: 'Text Document',disabled: true }
        ]},
        { sep: true },
        { label: 'Properties', action: () => RW.Desktop.openDisplayProperties() }
      ]);
    }
  });
})();
