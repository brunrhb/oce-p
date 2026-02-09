document.addEventListener("project:open", (e) => {
  const trigger = e.detail?.trigger;
  if (!trigger) return;

  // attendre que le DOM se "pose" après ouverture
  requestAnimationFrame(() => {
    const offset = 18; // ajuste 12–24
    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight || 0;

    // si déjà dans le 1er tiers, ne bouge pas
    if (rect.top >= 0 && rect.top <= viewportH * 0.33) return;

    const targetY = Math.max(0, window.scrollY + rect.top - offset);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    window.scrollTo({
      top: targetY,
      behavior: reduce ? "auto" : "smooth",
    });
  });
});
