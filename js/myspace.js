/* myspace.js - Fake mid-2000s MySpace page rendered inside the IE shell. */

(function () {
  const RW = window.RW = window.RW || {};
  const MS = RW.MySpace = {};
  const ID = 'myspace';

  // === Top 8 movies. Swap titles or year here. ===
  const TOP_8 = [
    { title: 'The Royal Tenenbaums', year: 2001 },
    { title: 'Lost in Translation',  year: 2003 },
    { title: 'Mulholland Drive',     year: 2001 },
    { title: 'City of God',          year: 2002 },
    { title: 'Donnie Darko',         year: 2001 },
    { title: 'Spirited Away',        year: 2001 },
    { title: 'Pulp Fiction',         year: 1994 },
    { title: 'Magnolia',             year: 1999 }
  ];
  MS.TOP_8 = TOP_8;

  // === Wholesome friend comments ===
  const COMMENTS = [
    { author: 'Mom',                       date: 'Nov 14, 2005',  body: 'remember that camera you saved up for in 8th grade? glad you used it' },
    { author: 'JonE_92',                   date: 'Oct 28, 2005',  body: 'still owe you for the wedding video. it played at our 10 year anniversary too.' },
    { author: 'Mike_T',                    date: 'Oct 22, 2005',  body: 'your basement films were better than the ones in theaters.' },
    { author: 'Mrs. Carbone (English)',    date: 'Oct 09, 2005',  body: "you're going to do this for a living one day. mark my words." },
    { author: 'Drama_Beth',                date: 'Sept 30, 2005', body: 'thanks for letting me read those scenes out loud in your bedroom. you really listened.' },
    { author: 'cousin_pat',                date: 'Sept 21, 2005', body: 'showed your reel at thanksgiving. grandpa actually cried. in a good way.' },
    { author: 'lil_ricky_nextdoor',        date: 'Sept 12, 2005', body: 'still telling people i was in a real movie because you let me hold a slate. you are the man.' },
    { author: 'Mr. Donnelly (Drama club)', date: 'Sept 02, 2005', body: 'you stayed late every Thursday to learn the light board. that is the whole secret right there.' }
  ];
  MS.COMMENTS = COMMENTS;

  MS.isOpen = function () { return !!RW.WM.get(ID); };

  MS.open = function () {
    if (RW.WM.get(ID)) { RW.WM.bringToFront(ID); return; }

    const page = document.createElement('div');
    page.className = 'msp-page';
    page.innerHTML = pageHTML();

    const w = RW.IE.openURL({
      id: ID,
      url: 'http://www.myspace.com/rickwayne_directs',
      title: 'Rick Wayne | myspace.com',
      width: 880,
      height: 640,
      contentNode: page,
      onClose: () => {
        // If Mixtape window is not open, stop engine to be tidy.
        if (!RW.WM.get('mixtape')) {
          if (RW.Mixtape && RW.Mixtape._engine) RW.Mixtape._engine.stop();
        }
      }
    });

    wireFriendSpace(page);
    wireContactBox(page);
    wireMusicWidget(page);
  };

  function pageHTML() {
    const top8 = TOP_8.map((m, i) => (
      '<div class="msp-top8-tile" data-idx="' + i + '">' +
        '<div class="msp-top8-art">' +
          '<div class="msp-top8-stripe"></div>' +
          '<div class="msp-top8-title">' + escapeHtml(m.title) + '</div>' +
          '<div class="msp-top8-year">' + m.year + '</div>' +
        '</div>' +
      '</div>'
    )).join('');

    const comments = COMMENTS.map(c => (
      '<div class="msp-comment">' +
        '<div class="msp-comment-avatar"></div>' +
        '<div class="msp-comment-body">' +
          '<div class="msp-comment-meta">' +
            '<span class="msp-comment-author">' + escapeHtml(c.author) + '</span>' +
            '<span class="msp-comment-date">' + escapeHtml(c.date) + '</span>' +
          '</div>' +
          '<div class="msp-comment-text">' + escapeHtml(c.body) + '</div>' +
        '</div>' +
      '</div>'
    )).join('');

    return (
      '<div class="msp-sparkles"></div>' +
      '<div class="msp-topband">' +
        '<div class="msp-topband-inner">' +
          '<div class="msp-logo">myspace<span class="msp-dot">.</span>com<span class="msp-tag">a place for friends</span></div>' +
          '<div class="msp-nav">' +
            ['Home','Browse','Search','Invite','Film','Mail','Blog','Favorites','Forum','Groups','Events','Videos','Music','Comedy','Classifieds']
              .map(l => '<a href="#" onclick="return false">' + l + '</a>').join(' | ') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="msp-musicwidget" id="msp-musicwidget">' +
        '<div class="msp-mw-title">My Music Player</div>' +
        '<div class="msp-mw-disc">' +
          '<div class="msp-mw-spin"></div>' +
          '<div class="msp-mw-controls">' +
            '<button data-msa="prev">|&laquo;</button>' +
            '<button data-msa="toggle">&#9658;</button>' +
            '<button data-msa="next">&raquo;|</button>' +
          '</div>' +
        '</div>' +
        '<div class="msp-mw-now" id="msp-mw-now">Loading...</div>' +
        '<div class="msp-mw-repeat" id="msp-mw-repeat">is on REPEAT</div>' +
      '</div>' +

      '<div class="msp-main">' +
        '<div class="msp-left">' +
          '<div class="msp-profilepic">' +
            '<div class="msp-profilepic-inner">' +
              '<div class="msp-pp-glow"></div>' +
              '<div class="msp-pp-initials">RW</div>' +
              '<div class="msp-pp-scan"></div>' +
            '</div>' +
          '</div>' +
          '<div class="msp-name">Rick Wayne</div>' +
          '<div class="msp-subtitle">"directing the basement, before they let me direct the world"</div>' +
          '<div class="msp-meta">' +
            '<div><b>Brooklyn, US</b></div>' +
            '<div>Last Login: 3/14/2006</div>' +
            '<div class="msp-mood">Mood: directing :)</div>' +
            '<div class="msp-viewmy">View My: <a href="#" onclick="return false">Pics</a> | <a href="#" onclick="return false">Videos</a> | <a href="#" onclick="return false">Friends</a></div>' +
          '</div>' +
          '<div class="msp-contactbox">' +
            '<div class="msp-cb-title">Contacting Rick</div>' +
            '<div class="msp-cb-grid">' +
              '<a class="msp-cb-btn" id="msp-send-message" href="mailto:rick_wayne@me.com">' +
                '<span class="msp-cb-icon">&#9993;</span><span>Send Message</span>' +
              '</a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="forward"><span class="msp-cb-icon">&#10148;</span><span>Forward to Friend</span></a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="add"><span class="msp-cb-icon">+</span><span>Add to Friends</span></a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="fave"><span class="msp-cb-icon">&#9733;</span><span>Add to Favorites</span></a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="block"><span class="msp-cb-icon">&#8856;</span><span>Block User</span></a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="group"><span class="msp-cb-icon">&#9776;</span><span>Add to Group</span></a>' +
              '<a class="msp-cb-btn" href="#" onclick="return false" data-msaction="rank"><span class="msp-cb-icon">#</span><span>Rank User</span></a>' +
            '</div>' +
          '</div>' +
          '<div class="msp-url">' +
            '<div class="msp-url-label">MySpace URL:</div>' +
            '<div class="msp-url-val">myspace.com/<b>rickwayne_directs</b></div>' +
          '</div>' +
        '</div>' +

        '<div class="msp-right">' +

          '<div class="msp-section">' +
            '<div class="msp-section-title">Rick\'s Interests</div>' +
            '<table class="msp-interests-table">' +
              '<tr><th>General</th><td>Filmmaking. Cameras. Cutting in the basement. Looking at the world like it\'s a roll of film waiting to be shot.</td></tr>' +
              '<tr><th>Music</th><td>Whatever\'s on the mixtape. Open Mixtape.exe.</td></tr>' +
              '<tr><th>Movies</th><td>I\'ll show you my Top 8.</td></tr>' +
              '<tr><th>Television</th><td>SportsCenter on mute. The Sopranos. Whatever\'s on after my parents fall asleep.</td></tr>' +
              '<tr><th>Books</th><td>"In the Blink of an Eye" - Walter Murch. Read it on the bus.</td></tr>' +
              '<tr><th>Heroes</th><td>Anyone who ever made a movie and meant it.</td></tr>' +
            '</table>' +
          '</div>' +

          '<div class="msp-section">' +
            '<div class="msp-section-title msp-section-title-blue">About Me</div>' +
            '<div class="msp-section-body">' +
              '<p>What\'s up. I\'m a director based in Brooklyn. Mostly commercial work, music videos when somebody asks nicely, short films when nobody asks at all. I learned to cut on Movie Maker on my dad\'s 1999 Compaq. I\'m still learning.</p>' +
              '<p>If you\'re a producer / agency / brand and you\'re reading this in 2026 instead of 2006, hi. Hiring inquiries: <a href="mailto:rick_wayne@me.com">rick_wayne@me.com</a>.</p>' +
              '<p>Heart on sleeve. Camera on shoulder. <span class="msp-heart">&#9829;</span></p>' +
            '</div>' +
          '</div>' +

          '<div class="msp-section">' +
            '<div class="msp-section-title">Rick\'s Friend Space (Top 8)</div>' +
            '<div class="msp-section-body">' +
              '<div class="msp-friend-tom" id="msp-friend-tom" title="Tom">' +
                '<div class="msp-friend-avatar msp-friend-tom-avatar">Tom</div>' +
                '<div class="msp-friend-label">Tom</div>' +
              '</div>' +
              '<div class="msp-top8-grid">' +
                top8 +
              '</div>' +
              '<div class="msp-top8-foot">View All of Rick\'s Friends</div>' +
            '</div>' +
          '</div>' +

          '<div class="msp-section">' +
            '<div class="msp-section-title msp-section-title-blue">Rick\'s Friends Comments</div>' +
            '<div class="msp-section-body">' +
              '<div class="msp-comments">' +
                comments +
              '</div>' +
              '<div class="msp-comments-foot">' +
                '<a href="#" onclick="return false">View All Comments</a> | <a href="#" onclick="return false">Add Comment</a>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>' +

      '<div class="msp-footer">' +
        '&copy; 2003-2006 MySpace.com. All Rights Reserved. <span class="msp-heart">&#9829;</span> a place for friends.' +
      '</div>'
    );
  }

  function wireFriendSpace(page) {
    // Tom easter egg
    const tom = page.querySelector('#msp-friend-tom');
    if (tom) {
      tom.addEventListener('click', () => {
        const html = '<div class="dialog-body">' +
          '<p><b>Tom</b></p>' +
          '<p>Tom hasn\'t logged in since 2009. He\'s doing fine.</p>' +
          '</div><div class="dialog-buttons"><button data-close>OK</button></div>';
        const aw = RW.WM.open({
          title: 'MySpace',
          icon: RW.IE.icon(),
          width: 340, height: 180,
          resizable: false,
          contentHTML: html
        });
        aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
        if (RW.Audio) RW.Audio.ding();
      });
    }
    // Top 8 hover handled by CSS; click no-op
    page.querySelectorAll('.msp-top8-tile').forEach(t => {
      t.addEventListener('click', () => {
        if (RW.Audio) RW.Audio.click();
      });
    });
  }

  function wireContactBox(page) {
    // Send Message handled by mailto: directly. Others show a tiny gag toast.
    page.querySelectorAll('[data-msaction]').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.dataset.msaction;
        const msg = {
          forward: 'Forwarded! (jk, no one forwarded anything in 2006 either)',
          add:     "You're already on Rick's friends list. Probably.",
          fave:    "Added to Rick's favorites. He noticed.",
          block:   "Are you sure? Rick is wholesome.",
          group:   "There's no group. There's just the work.",
          rank:    "Ranked. 10/10. Casting directors only."
        }[a] || 'OK.';
        const html = '<div class="dialog-body"><p>' + RW.WM.escapeHtml(msg) + '</p></div>' +
          '<div class="dialog-buttons"><button data-close>OK</button></div>';
        const aw = RW.WM.open({
          title: 'MySpace', icon: RW.IE.icon(),
          width: 320, height: 160, resizable: false, contentHTML: html
        });
        aw.body.querySelector('[data-close]').addEventListener('click', () => RW.WM.close(aw.id));
      });
    });
  }

  function wireMusicWidget(page) {
    const nowEl = page.querySelector('#msp-mw-now');
    const repeatEl = page.querySelector('#msp-mw-repeat');
    const toggleBtn = page.querySelector('[data-msa="toggle"]');
    const prevBtn = page.querySelector('[data-msa="prev"]');
    const nextBtn = page.querySelector('[data-msa="next"]');
    const Eng = RW.Mixtape && RW.Mixtape._engine;
    if (!Eng) return;

    function render(idx) {
      const t = RW.Mixtape.MIXTAPE[idx < 0 ? 0 : idx];
      nowEl.innerHTML = '<b>' + escapeHtml(t.title) + '</b> - by ' + escapeHtml(t.artist);
      repeatEl.textContent = 'is on REPEAT';
    }
    function syncBtn() {
      toggleBtn.textContent = Eng.isPlaying ? 'II' : '▶';
    }

    render(Eng.activeIndex < 0 ? 0 : Eng.activeIndex);
    syncBtn();

    // Auto-play on first user gesture (browser policies). Hook to any click
    // on the page that bubbles up. We try right away too, in case sound was
    // already unlocked by the Win95 startup chime.
    function tryAutoplay() {
      if (Eng.isPlaying) return;
      if (Eng.activeIndex < 0) {
        Eng.playIndex(0);
      } else {
        Eng.resume();
      }
      syncBtn();
    }
    setTimeout(tryAutoplay, 300);
    const oneShot = () => { tryAutoplay(); document.removeEventListener('mousedown', oneShot); };
    document.addEventListener('mousedown', oneShot, { once: true });

    toggleBtn.addEventListener('click', () => {
      if (Eng.isPlaying) Eng.pause();
      else if (Eng.activeIndex < 0) Eng.playIndex(0);
      else Eng.resume();
      syncBtn();
    });
    prevBtn.addEventListener('click', () => { Eng.prev(); syncBtn(); });
    nextBtn.addEventListener('click', () => { Eng.next(); syncBtn(); });

    const unsub1 = Eng.onTrackChange((i) => { render(i); syncBtn(); });
    const unsub2 = Eng.onTrackEnd(() => {
      // Auto-repeat playlist
      Eng.next();
      syncBtn();
    });

    // Cleanup when MySpace closes
    const win = RW.WM.get(ID);
    if (win) {
      const origClose = win.onClose;
      win.onClose = function () {
        try { unsub1(); } catch (e) {}
        try { unsub2(); } catch (e) {}
        if (origClose) origClose();
      };
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }
})();
