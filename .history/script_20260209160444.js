document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.PROJET');
  let openItem = null;

  triggers.forEach((t) => {
    const targetSelector = t.getAttribute('data-target');
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    // état initial: tout fermé
    target.classList.add('is-hidden');

    // accessibilité
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-controls', target.id);
    t.setAttribute('aria-expanded', 'false');

    const close = () => {
      if (target.classList.contains('is-hidden')) return;
      target.classList.add('is-hidden');
      t.classList.remove('is-open');
      t.setAttribute('aria-expanded', 'false');
      requestAnimationFrame(() => syncExtraitOffset(target));
    };

    const open = () => {
      if (!target.classList.contains('is-hidden')) return;
      target.classList.remove('is-hidden');
      t.classList.add('is-open');
      t.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => syncExtraitOffset(target));
      window.__afterToggleRecalc = afterToggleRecalc;
    };

    const toggle = () => {
      const isOpening = target.classList.contains('is-hidden');

      // ouvrir -> fermer l’ancien si besoin
      if (isOpening && openItem && openItem.t !== t) {
        openItem.close();
        openItem = null;
      }

      if (isOpening) {
        open();
        openItem = { t, close };
      } else {
        close();
        openItem = null;
      }
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
        img.style.setProperty('--parallax', `${moveAmount}px`);

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

