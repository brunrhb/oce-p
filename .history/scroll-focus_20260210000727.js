// scroll-focus.js — focus scroll sur le titre du projet ouvert

document.addEventListener("project:open", (e) => {
  const trigger = e.detail?.trigger;
  if (!trigger) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Réglages
  const OFFSET = 18;        // 12–24 : respiration au-dessus du titre
  const DURATION = 650;     // 500–900 : plus grand = plus lent
  const VIEWPORT_ZONE = 0.25; // si le titre est déjà dans le 1er quart, ne bouge pas
  const EPS = 6;            // évite micro-mouvements

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateScrollTo(targetY, duration = DURATION) {
    const startY = window.scrollY;
    const delta = targetY - startY;
    if (Math.abs(delta) < EPS) return;

    const start = performance.now();

    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      window.scrollTo(0, startY + delta * eased);
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function computeTargetY() {
    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // Si déjà bien placé, pas de scroll
    if (rect.top >= 0 && rect.top <= vh * VIEWPORT_ZONE) return null;

    let targetY = window.scrollY + rect.top - OFFSET;

    // clamp max scroll
    const maxY = Math.max(0, document.documentElement.scrollHeight - vh);
    if (targetY > maxY) targetY = maxY;
    if (targetY < 0) targetY = 0;

    // évite micro moves
    if (Math.abs(window.scrollY - targetY) < EPS) return null;

    return targetY;
  }

  function go() {
    const targetY = computeTargetY();
    if (targetY == null) return;

    if (reduce) {
      window.scrollTo(0, targetY);
    } else {
      animateScrollTo(targetY, DURATION);
    }
  }

  // 1) après premier layout pass
  requestAnimationFrame(go);
  // 2) après stabilisation (images / recalcs)
  setTimeout(go, 120);
});
