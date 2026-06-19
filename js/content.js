/* content.js - shared content alias.
   data.js (loaded first) is the canonical source for bio, projects, press.
   This file adds the About copy (the desktop About window inlines its own
   HTML; mobile reads structured copy from here), social handles, and exposes
   everything under RW.CONTENT for the mobile bundle to consume.

   When you update copy:
   - bio / projects / press: edit js/data.js (used by desktop AND mobile)
   - About body copy / matrix caption / I Believe text: edit this file
*/

(function () {
  const RW = window.RW = window.RW || {};
  const bio = (RW.bio && Object.assign({}, RW.bio)) || {};

  // Augment bio with social handles that the desktop doesn't expose by default
  // but that mobile needs in the footer. Safe to add even if already present.
  if (!bio.linkedin)  bio.linkedin  = "https://www.linkedin.com/in/rickwaynenyc/";
  if (!bio.vimeo)     bio.vimeo     = "https://vimeo.com/rickwayne";
  if (!bio.instagram) bio.instagram = "https://instagram.com/rick_wayne";
  if (!bio.email)     bio.email     = "rick_wayne@me.com";
  RW.bio = bio;

  RW.CONTENT = {
    bio: bio,
    projects: RW.projects || [],
    press:    RW.press    || [],
    about: {
      title: "RICK WAYNE - DIRECTOR.SYS",
      subtitle: "Rick Wayne. Director. Creative Director. Writer. Brooklyn, NY.",
      intro: "I was born in 1989. That's why you're seeing this hidden Windows theme. My career started here, on a beige Windows 95 machine, making home videos in Windows Movie Maker in 2003. I never stopped. I hone the craft every day.",
      firstShootHeading: "FIRST SHOOT",
      firstShootCaption: "This is the first time I ever picked up a camera. Me and my friends made a movie called The Matrix. We didn't know what we were doing. We didn't care. I haven't stopped since.",
      matrixImage: "images/1%20(80).JPG",
      believeHeading: "I BELIEVE",
      believeCopy: "Great commercial work is great human work first. Strategy is a craft. Directing is a craft. Casting is a craft. Editing is a craft. The brief is a starting point, not a ceiling. The best films feel inevitable. They never are.",
      copyright: "(c) 1993-2026 Rick Wayne. All rights reserved."
    }
  };
})();
