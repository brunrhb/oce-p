// gap.js — aligne image + col3 sur le début de "Nos corps..."
(() => {
  const SECTION = document.querySelector('#projet1');
  if (!SECTION) return;

  const WRAP = SECTION.querySelector('.p1');
  if (!WRAP) return;

  const TITLE_SEL = '.extrait-titre[data-content="p1s2-extrait-titre"]';
  const BODY1_SEL  = '.extrait[data-content="p1s2-extrait1"]';

  let raf = 0;

  function compute() {
    raf = 0;

    // si projet fermé, pas de mesure
    if (SECTION.classList.contains('is-hidden')) return;

    const title = SECTION.querySelector(TITLE_SEL);
    const body1 = SECTION.querySelector(BODY1_SEL);
    if (!title || !body1) return;

    const gap = Math.max(
      0,
      Math.round(body1.getBoundingClientRect().top - title.getBoundingClientRect().top)
    );

    WRAP.style.setProperty('--extrait-offset', `${gap}px`);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(compute);
  }

  // run tôt + stable
  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);
  if (document.fonts?.ready) document.fonts.ready.then(schedule);

  // si tu ouvres/fermes un projet
  document.addEventListener('click', (e) => {
    if (e.target.closest('.PROJET')) schedule();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.PROJET')) schedule();
  });

  // resize
  window.addEventListener('resize', schedule, { passive: true });

  // si le bloc change de taille (wrap, fonts, etc.)
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(schedule);
    const title = SECTION.querySelector(TITLE_SEL);
    const body1 = SECTION.querySelector(BODY1_SEL);
    if (title) ro.observe(title);
    if (body1) ro.observe(body1);
  }
})();
