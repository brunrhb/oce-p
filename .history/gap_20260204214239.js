// extrait-gap.js — aligne image + col3 sur le début de "Nos corps..."
(function () {
  function computeAndApply() {
    const p1 = document.querySelector('.p1');
    if (!p1) return;

    // si le projet 1 est fermé, on ne mesure pas (display:none => mesures fausses)
    const section = p1.closest('section');
    if (section && section.classList.contains('is-hidden')) return;

    const zoneTitre = p1.querySelector('.col-p1s2-2 .text-block-p1s2');
    const titre = zoneTitre?.querySelector('.extrait-titre');
    const body = zoneTitre?.querySelector('.extrait[data-content="p1s2-extrait1"]'); // "Nos corps..."

    if (!titre || !body) return;

    const gap = Math.max(
      0,
      Math.ceil(body.getBoundingClientRect().top - titre.getBoundingClientRect().top)
    );

    p1.style.setProperty('--extrait-offset', `${gap}px`);
  }

  // calc au bon timing (fonts + ouverture/fermeture + resize)
  document.addEventListener('DOMContentLoaded', computeAndApply);
  if (document.fonts?.ready) document.fonts.ready.then(computeAndApply);

  // après clic/Enter/Espace sur les titres (.PROJET), on recalc au frame suivant
  document.addEventListener('click', (e) => {
    if (e.target.closest('.PROJET')) requestAnimationFrame(computeAndApply);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.PROJET')) {
      requestAnimationFrame(computeAndApply);
    }
  });

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(computeAndApply, 120);
  });
})();
