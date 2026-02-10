document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.PROJET');
  let openItem = null;

  triggers.forEach((t) => {
    const targetSelector = t.getAttribute('data-target');
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    // état initial : tout fermé (si pas déjà)
    target.classList.add('is-hidden');

    const close = () => {
      target.classList.add('is-hidden');
      t.classList.remove('is-open');
    };

    const open = () => {
      target.classList.remove('is-hidden');
      t.classList.add('is-open');
      document.dispatchEvent(new CustomEvent("project:open", { detail: { trigger: t } }));

    };

    const toggle = () => {
      const isOpening = target.classList.contains('is-hidden');

      if (isOpening && openItem && openItem.t !== t) {
        openItem.close();
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

