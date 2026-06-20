// welcome-note.js
// A pinned Post-It on the desktop saying hi. Dismissable, with the dismissal
// remembered for the rest of the session.

(function () {
  const KEY = 'rw93_welcome_dismissed_v1';
  const note = document.getElementById('welcome-note');
  const dismiss = document.getElementById('welcome-note-dismiss');
  if (!note || !dismiss) return;

  // If they've dismissed it this session, don't show it again.
  try {
    if (sessionStorage.getItem(KEY) === '1') {
      note.hidden = true;
      note.style.display = 'none';
      return;
    }
  } catch (e) { /* sessionStorage may be blocked */ }

  dismiss.addEventListener('click', function (e) {
    e.preventDefault();
    note.style.transition = 'opacity 200ms ease, transform 200ms ease';
    note.style.opacity = '0';
    note.style.transform = 'rotate(-1.6deg) translateY(8px)';
    setTimeout(function () {
      note.style.display = 'none';
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }, 220);
  });
})();
