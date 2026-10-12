/* KOSIF EARTH: progressive 4K desktop / mobile cinematic introduction.
   Decorative film only. Does not read, mutate, or share any company or auth data. */
(() => {
  'use strict';
  const overlay = document.getElementById('kosif-earth-intro');
  const video = document.getElementById('kosif-earth-movie');
  const skip = document.getElementById('kosif-earth-skip');
  const enter = document.getElementById('kosif-earth-enter');
  const sound = document.getElementById('kosif-earth-sound');
  if (!overlay || !video || !skip || !enter) return;
  /* the code-rendered story (earth-story.js) owns the overlay when it runs; the film is the fallback */
  if (document.documentElement.classList.contains('es-on')) return;

  const prefers = (query) => !!(window.matchMedia && window.matchMedia(query).matches);
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const deepLink = !!(window.location.search || window.location.hash);
  let seen = false;
  try { seen = sessionStorage.getItem('kosif-earth-intro-seen-v1') === '1'; } catch {}
  if (seen || deepLink || prefers('(prefers-reduced-motion: reduce)') ||
      (connection && connection.saveData) ||
      (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2)) return;

  const shell = document.querySelector('.shell');
  const previousInert = !!(shell && shell.inert);
  const mobileSrc = video.dataset.src;
  const desktopSrc = video.dataset.src4k;
  const canPlayHigh = !!desktopSrc && prefers('(min-width: 1100px)') &&
    !(connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.effectiveType === '3g'));
  let usingHigh = canPlayHigh;
  let closed = false;
  let failSafe = null;
  let completion = null;

  const finish = () => {
    if (closed) return;
    closed = true;
    if (failSafe) clearTimeout(failSafe);
    if (completion) clearTimeout(completion);
    video.pause();
    video.removeAttribute('src');
    video.load();
    overlay.hidden = true;
    overlay.classList.remove('is-playing');
    document.body.classList.remove('earth-intro-open');
    if (shell) shell.inert = previousInert;
    try { sessionStorage.setItem('kosif-earth-intro-seen-v1', '1'); } catch {}
    document.removeEventListener('keydown', onKeyDown);
    const first = document.querySelector('#gate-list button:not([disabled])');
    if (first && typeof first.focus === 'function') first.focus();
  };

  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key === 'Tab') {
      // The buttons are the only focusable controls in this dialog.
      const controls = [sound, skip, enter].filter(Boolean);
      const pos = controls.indexOf(document.activeElement);
      if (event.shiftKey && pos === 0) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && pos === controls.length - 1) {
        event.preventDefault();
        controls[0].focus();
      }
    }
  }
  function play() {
    const promise = video.play();
    if (promise && typeof promise.then === 'function') {
      promise.then(() => overlay.classList.add('is-playing')).catch(() => {
        overlay.classList.add('is-complete');
      });
    }
  }
  skip.addEventListener('click', finish);
  enter.addEventListener('click', finish);
  if (sound) sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sound.setAttribute('aria-pressed', String(!video.muted));
    sound.textContent = video.muted ? 'تشغيل الصوت' : 'كتم الصوت';
    // A user gesture can unlock playback if silent autoplay was initially blocked.
    if (video.paused) play();
  });

  video.addEventListener('ended', () => {
    overlay.classList.add('is-complete');
    completion = setTimeout(finish, 950);
  }, {once:true});
  video.addEventListener('error', () => {
    if (closed) return;
    // If 4K is unavailable, gracefully retry the 720p clip exactly once.
    if (usingHigh && mobileSrc) {
      usingHigh = false;
      video.src = mobileSrc;
      play();
      return;
    }
    overlay.classList.add('is-complete');
    completion = setTimeout(finish, 900);
  });
  overlay.hidden = false;
  document.body.classList.add('earth-intro-open');
  if (shell) shell.inert = true;
  skip.focus();
  document.addEventListener('keydown', onKeyDown);
  video.src = canPlayHigh ? desktopSrc : mobileSrc;
  video.muted = true;
  video.playsInline = true;
  play();
  failSafe = setTimeout(finish, 14000);
})();
