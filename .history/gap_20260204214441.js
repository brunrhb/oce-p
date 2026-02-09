// extrait-gap.js — Project 1 / Partie 2 : aligne image + col3 sur le début de "Nos corps..."
(function () {
  const SECTION = '#projet1';
  const WRAP = `${SECTION} .p1`;

  const TITLE = `${SECTION} .extrait-titre[data-content="p1s2-extrait-titre"]`;
  const BODY1 = `${SECTION} .extrait[data-content="p1s2-extrait1"]`;

  const APPLY = [
    `${SECTION} .media-block-pls2-2`,
    `${SECTION} .col-pls2-3`,
  ];

  function compute() {
    const wrap = document.querySelector(WRAP);
    if (!wrap) return;

    // si projet fermé (display:none), mesures fausses -> skip
    const section = wrap.closest('section');
    if (section && section.classList.contains('is-hidden')) return;

    const title = document.querySelector(TITLE);
    const body1 = document.querySelector(BODY1);
    if (!title || !body1) return;

    const gap = Math.max(
      0,
      Math.ceil(body1.getBoundingClientRect().top - title.getBoundingClientRect().top)
    );

    wrap.style.setProperty('--extrait-offset', `${gap}px`);

    // applique le margin-top aux bons blocs
    APPLY.forEach(sel => document.querySelectorAll(sel).forEach(el => {
      el.style.marginTop = `var(--extrait-offset)`;
    }));
  }

  // timing correct
  const run = () => requestAnimationFrame(compute);

  document.addEventListener('DOMContentLoaded', run);
  if (document.fonts?.ready) document.fonts.ready.then(run);

  // recalc après ouverture/fermeture
  document.addEventListener('click', (e) => {
    if (e.target.closest('.PROJET')) run();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.PROJET')) run();
  });

  // resize throttlé
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(run, 120);
  });

  // si le titre/body wrap (changement largeur/typo), ça suit
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(run);
    document.addEventListener('DOMContentLoaded', () => {
      [TITLE, BODY1].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) ro.observe(el);
      });
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        [TITLE, BODY1].forEach(sel => {
          const el = document.querySelector(sel);
          if (el) ro.observe(el);
        });
      });
    }
  }
})();
