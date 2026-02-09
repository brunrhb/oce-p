document.querySelectorAll('.PROJET').forEach((t) => {
  const target = document.querySelector(t.getAttribute('data-target'));
  if (!target) return;

  // état initial
  target.classList.add('is-hidden');

  t.addEventListener('click', () => {
    const willOpen = target.classList.contains('is-hidden');

    // fermer tous les projets
    document.querySelectorAll('section[id^="projet"]').forEach((s) => s.classList.add('is-hidden'));
    document.querySelectorAll('.PROJET').forEach((x) => x.classList.remove('is-open'));

    // ouvrir seulement si on voulait ouvrir
    if (willOpen) {
      target.classList.remove('is-hidden');
      t.classList.add('is-open');
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

