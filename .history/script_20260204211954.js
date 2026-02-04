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
// --- Offset auto (aligner image + col3 sur le début du body) ---
function syncExtraitOffset(scope = document) {
  scope.querySelectorAll('.p1').forEach(p1 => {
    const titre = p1.querySelector('.extrait-titre');
    if (!titre) return;

    const rect = titre.getBoundingClientRect();
    const mb = parseFloat(getComputedStyle(titre).marginBottom) || 0;

    const offset = Math.ceil(rect.height + mb);
    p1.style.setProperty('--extrait-offset', `${offset}px`);
  });
}

// recalcul après chargement des fontes (évite les mesures fausses)
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => syncExtraitOffset());
}

// resize throttlé
let _r;
window.addEventListener('resize', () => {
  clearTimeout(_r);
  _r = setTimeout(() => syncExtraitOffset(), 120);
});
