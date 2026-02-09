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



(() => {
  // ====== CONFIG : mets ici TES classes exactes ======
  const PROJECT_SCOPE = '.p1';                 // scope d'un projet (ou remplace par '.project' etc.)
  const TEXT_ZONE     = '.text-block-p1s2';    // container qui contient titre + body
  const TITLE_EL      = '.extrait-titre';      // "Extrait du texte :"
  const BODY_EL       = '.extrait';            // commence par "Nos corps..."

  const APPLY_TO = ['.media-block-p1s2-2', '.col-p1s2-3']; // les 2 blocs à décaler
  // ====================================================

  function measureGap(projectEl) {
    const zone = projectEl.querySelector(TEXT_ZONE);
    if (!zone) return null;

    const title = zone.querySelector(TITLE_EL);
    const body  = zone.querySelector(BODY_EL);
    if (!title || !body) return null;

    const gap = Math.ceil(body.getBoundingClientRect().top - title.getBoundingClientRect().top);
    return Math.max(0, gap);
  }

  function applyGap(projectEl, gap) {
    projectEl.style.setProperty('--extrait-offset', `${gap}px`);
    APPLY_TO.forEach(sel => {
      projectEl.querySelectorAll(sel).forEach(el => {
        el.style.marginTop = `var(--extrait-offset)`;
      });
    });
  }

  function syncOne(projectEl) {
    const gap = measureGap(projectEl);
    if (gap == null) return;
    applyGap(projectEl, gap);
  }

  function syncAll(scope = document) {
    scope.querySelectorAll(PROJECT_SCOPE).forEach(syncOne);
  }

  // --- Run: DOM + fonts (typos) ---
  document.addEventListener('DOMContentLoaded', () => syncAll());
  if (document.fonts?.ready) document.fonts.ready.then(() => syncAll());

  // --- Resize throttlé ---
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => syncAll(), 120);
  });

  // --- Observe: changements de layout (wrap, contenu injecté, images, etc.) ---
  const runRAF = () => requestAnimationFrame(() => syncAll());
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(runRAF);
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll(`${PROJECT_SCOPE} ${TEXT_ZONE}`).forEach(z => ro.observe(z));
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        document.querySelectorAll(`${PROJECT_SCOPE} ${TEXT_ZONE}`).forEach(z => ro.observe(z));
      });
    }
  }
  if ('MutationObserver' in window) {
    const mo = new MutationObserver(runRAF);
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll(PROJECT_SCOPE).forEach(p => mo.observe(p, {
        subtree: true, childList: true, characterData: true, attributes: true
      }));
    });
  }

  // --- Hook pour ton toggle : appelle après ouverture/fermeture ---
  window.__syncExtraitGap = (projectElOrSelector) => {
    const el = typeof projectElOrSelector === 'string'
      ? document.querySelector(projectElOrSelector)
      : projectElOrSelector;
    if (el) requestAnimationFrame(() => syncOne(el));
    else requestAnimationFrame(() => syncAll());
  };
})();
