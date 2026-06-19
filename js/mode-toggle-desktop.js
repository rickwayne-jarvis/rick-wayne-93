/* mode-toggle-desktop.js - wires the "Mobile view" tray icon and start menu
   entry to switch the user to the mobile experience by setting sessionStorage
   and reloading. */

(function () {
  function go() {
    try { sessionStorage.setItem('view-mode', 'mobile'); } catch (e) {}
    location.reload();
  }
  function bind() {
    var tray = document.getElementById('tray-mobile-view');
    if (tray && !tray._wired) {
      tray._wired = true;
      tray.addEventListener('click', function (e) {
        e.preventDefault();
        go();
      });
    }
  }
  document.addEventListener('rw:desktop-ready', bind);
  document.addEventListener('DOMContentLoaded', bind);

  // Hook into startmenu's switch-to-mobile action. The startmenu dispatcher
  // routes by data-action; we patch in our handler by listening for clicks on
  // any element with data-action="switch-to-mobile".
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action="switch-to-mobile"]');
    if (!el) return;
    e.preventDefault();
    go();
  });
})();
