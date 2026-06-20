// embed.js
//
// When the rick-wayne-93 desktop is loaded inside an iframe (as the
// overlay on rickwayne.cc does), inject a big obvious close button in
// the top-left of the viewport. Clicking it posts a `close-overlay`
// message to the parent window so the host page can dismiss the
// overlay.
//
// Detection: ?embed=1 in the query string, OR window.parent !== window.
// Either condition triggers the button so a host can opt in by URL or
// by simply embedding.
//
// Defensive: entire body wrapped in try/catch so a bug here can never
// crash the desktop.
//
// KILL SWITCH: comment out the <script src="js/embed.js"> tag in
// index.html and the button disappears.

(function () {
    'use strict';

    function isEmbedded() {
        try {
            var search = (window.location.search || '').toLowerCase();
            if (search.indexOf('embed=1') !== -1) return true;
            if (window.parent && window.parent !== window) return true;
        } catch (err) {
            // Cross-origin frame access can throw; treat as embedded since
            // a same-origin top would never throw.
            return true;
        }
        return false;
    }

    function injectCloseButton() {
        try {
            if (!isEmbedded()) return;
            if (document.getElementById('rw93-embed-close')) return; // dedupe

            var btn = document.createElement('button');
            btn.id = 'rw93-embed-close';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Close and return to rickwayne.cc');
            btn.textContent = 'X';

            // Inline styles so this works without any new CSS file. Keeping
            // the styling local means a missing or out-of-date stylesheet
            // can't hide the only way out.
            btn.style.cssText = [
                'position:fixed',
                'top:8px',
                'left:8px',
                'z-index:99999',
                'width:44px',
                'height:44px',
                'background:#ffffff',
                'color:#000000',
                'border-top:2px solid #ffffff',
                'border-left:2px solid #ffffff',
                'border-right:2px solid #808080',
                'border-bottom:2px solid #808080',
                'box-shadow:inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #404040, 0 2px 8px rgba(0,0,0,0.6)',
                'font-family:Tahoma, "MS Sans Serif", "Segoe UI", sans-serif',
                'font-size:24px',
                'font-weight:bold',
                'line-height:1',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'cursor:pointer',
                'padding:0',
                '-webkit-appearance:none',
                'appearance:none'
            ].join(';') + ';';

            btn.addEventListener('mousedown', function () {
                // Win95-style pressed bevel.
                btn.style.borderTop = '2px solid #808080';
                btn.style.borderLeft = '2px solid #808080';
                btn.style.borderRight = '2px solid #ffffff';
                btn.style.borderBottom = '2px solid #ffffff';
            });

            btn.addEventListener('mouseup', function () {
                btn.style.borderTop = '2px solid #ffffff';
                btn.style.borderLeft = '2px solid #ffffff';
                btn.style.borderRight = '2px solid #808080';
                btn.style.borderBottom = '2px solid #808080';
            });

            btn.addEventListener('click', function (e) {
                try {
                    e.preventDefault();
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'close-overlay' }, '*');
                    }
                } catch (err) {
                    if (window.console && console.warn) {
                        console.warn('[embed] close click failed:', err);
                    }
                }
            });

            (document.body || document.documentElement).appendChild(btn);
        } catch (err) {
            if (window.console && console.warn) {
                console.warn('[embed] inject failed:', err);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCloseButton);
    } else {
        injectCloseButton();
    }
})();
