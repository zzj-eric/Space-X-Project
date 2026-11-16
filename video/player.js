(() => {
  'use strict';
  const film = document.getElementById('film');
  if (!film) return;
  const chapters = window.SPACE_X_VIDEO_CHAPTERS || [];
  const chapterContainer = document.getElementById('chapters');
  const title = document.getElementById('current-chapter');
  const time = document.getElementById('play-time');
  const storageKey = 'space-x-research-video-position-b97b02461380';
  let lastStoredSecond = -1;
  let initialized = false;
  const stamp = (seconds) => {
    const value = Math.max(0, Math.floor(seconds || 0));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  function update() {
    const position = film.currentTime || 0;
    const index = chapters.findIndex((chapter) => position >= chapter.start && position < chapter.end);
    const current = index < 0 ? Math.max(0, chapters.length - 1) : index;
    if (chapters[current]) title.textContent = chapters[current].title;
    chapterContainer.querySelectorAll('button').forEach((button, i) => {
      button.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    const duration = Number.isFinite(film.duration) ? film.duration : chapters.at(-1)?.end || 212;
    time.textContent = `${stamp(position)} / ${stamp(duration)}`;
    if (initialized && film.readyState > 0 && Math.floor(position) !== lastStoredSecond) {
      lastStoredSecond = Math.floor(position);
      try { localStorage.setItem(storageKey, String(position)); } catch (_) { /* Storage is optional. */ }
    }
  }
  async function seek(seconds, play = false) {
    if (!film.readyState) {
      film.addEventListener('loadedmetadata', () => seek(seconds, play), {once: true});
      film.load();
      return;
    }
    film.currentTime = Math.max(0, Math.min(seconds, film.duration - 0.05));
    update();
    if (play) {
      try { await film.play(); } catch (_) { /* Native controls remain available. */ }
    }
  }
  chapters.forEach((chapter, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'film-chapter';
    button.setAttribute('aria-label', `${chapter.title}, ${stamp(chapter.start)}`);
    const number = document.createElement('span');
    number.className = 'film-chapter-number';
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'film-chapter-copy';
    const name = document.createElement('span');
    name.className = 'film-chapter-name';
    name.textContent = chapter.title;
    const chapterTime = document.createElement('span');
    chapterTime.className = 'film-chapter-time';
    chapterTime.textContent = stamp(chapter.start);
    copy.append(name, chapterTime);
    button.append(number, copy);
    button.addEventListener('click', () => seek(chapter.start + 0.08, true));
    chapterContainer.append(button);
  });
  function initializePosition() {
    if (initialized) return;
    initialized = true;
    let saved = 0;
    try { saved = Number(localStorage.getItem(storageKey)) || 0; } catch (_) { /* Storage is optional. */ }
    if (saved > 0 && saved < film.duration - 2) film.currentTime = saved;
    update();
  }
  film.addEventListener('loadedmetadata', initializePosition, {once: true});
  if (film.readyState > 0) initializePosition();
  film.addEventListener('timeupdate', update);
  film.addEventListener('seeked', update);
  film.addEventListener('ended', () => {
    try { localStorage.removeItem(storageKey); } catch (_) { /* Storage is optional. */ }
  });
  film.addEventListener('error', () => { document.getElementById('playback-error').hidden = false; });
  document.getElementById('restart').addEventListener('click', () => seek(0, true));
  update();
})();
