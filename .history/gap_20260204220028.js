(() => {
  const WRAP  = '#projet1 .p1';
  const TITLE = '#projet1 .extrait-titre[data-content="p1s2-extrait-titre"]';
  const BODY1 = '#projet1 .extrait[data-content="p1s2-extrait1"]';

  function apply() {
    const wrap  = document.querySelector(WRAP);
    const title = document.querySelector(TITLE);
    const body1 = document.querySelector(BODY1);
    if (!wrap || !title || !body1) return;

    // gap = distance exacte entre haut du titre et haut de "Nos corps..."
    const gap = Math.max(0, Math.round(
      body1.getBoundingClientRect().top - title.getBoundingClientRect().top
    ));

    wrap.style.setProperty('--extrait-offset', `${gap}px`);
  }

  // 1) au chargement
  window.addEventListener('load', apply);
  // 2) après fonts (si dispo)
  if (document.fonts?.ready) document.fonts.ready.then(apply);
  // 3) après ouverture/fermeture (clic sur titre projet)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.PROJET')) requestAnimationFrame(apply);
  });
  // 4) resize
  window.addEventListener('resize', () => requestAnimationFrame(apply));
})();
