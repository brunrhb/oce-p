document.addEventListener('DOMContentLoaded', () => {
  // Sélecteur des titres cliquables
  const triggers = document.querySelectorAll('.PROJET');

  triggers.forEach((t) => {
    const targetSelector = t.getAttribute('data-target');
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    // état initial: caché
    target.classList.add('is-hidden');

    // accessibilité de base
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-controls', target.id);
    t.setAttribute('aria-expanded', 'false');

    const toggle = () => {
      const isHidden = target.classList.toggle('is-hidden');
      requestAnimationFrame(() => syncExtraitOffset(target));
      window.__afterToggleRecalc = afterToggleRecalc;
      t.setAttribute('aria-expanded', String(!isHidden));
    };

    t.addEventListener('click', toggle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Ajouter la gestion du parallax
  function handleParallax() {
    const images = document.querySelectorAll('[class*="placeholder"] img');
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    images.forEach((img) => {
      const parentBox = img.closest('[class*="placeholder"]');
      const boxTop = parentBox.getBoundingClientRect().top;
      const boxCenter = boxTop + parentBox.offsetHeight / 2;

      // Calculer la position relative dans la fenêtre
      const distanceFromCenter = windowHeight / 2 - boxCenter;

      // Limiter le mouvement à 15% de la hauteur de l'image
      const maxMove = (img.height * 0.15) / 2;
      const moveAmount = (distanceFromCenter / windowHeight) * maxMove;

      // Appliquer la transformation avec une transition douce
      requestAnimationFrame(() => {
        img.style.transform = `translateY(${moveAmount}px)`;
      });
    });
  }

  // Initialiser le parallax
  function initParallax() {
    // S'assurer que toutes les images sont chargées
    const images = document.querySelectorAll('[class*="placeholder"] img');
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', handleParallax);
      }
    });

    // Ajouter les event listeners
    window.addEventListener('scroll', handleParallax, { passive: true });
    window.addEventListener('resize', handleParallax, { passive: true });
  }

  initParallax();
});

// Liaison vegetal calc marge top
function syncExtraitOffset(scope = document) {
  scope.querySelectorAll('.p1').forEach(p1 => {
    const zone = p1.querySelector('.text-block-pls2');
    if (!zone) return;

    const titre = zone.querySelector('.extrait-titre');
    const body  = zone.querySelector('.extrait');
    if (!titre || !body) return;

    const offset = Math.max(
      0,
      Math.ceil(body.getBoundingClientRect().top - titre.getBoundingClientRect().top)
    );

    p1.style.setProperty('--extrait-offset', `${offset}px`);
  });
}

function afterToggleRecalc(targetEl) {
  requestAnimationFrame(() => syncExtraitOffset(targetEl || document));
}

// auto-run
document.addEventListener('DOMContentLoaded', () => syncExtraitOffset());
if (document.fonts?.ready) document.fonts.ready.then(() => syncExtraitOffset());

let _r;
window.addEventListener('resize', () => {
  clearTimeout(_r);
  _r = setTimeout(() => syncExtraitOffset(), 120);
});

if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(() => requestAnimationFrame(() => syncExtraitOffset()));
  function observeZones() {
    document.querySelectorAll('.p1 .text-block-pls2').forEach(z => ro.observe(z));
  }
  document.addEventListener('DOMContentLoaded', observeZones);
  if (document.fonts?.ready) document.fonts.ready.then(observeZones);
}

// hook pour le toggle
window.__afterToggleRecalc = afterToggleRecalc;

