document.addEventListener("project:open", (e) => {
  const trigger = e.detail?.trigger;
  if (!trigger) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function go() {
    const offset = 18; // ajuste 12–24
    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // déjà bien placé (titre dans le 1er quart) => ne bouge pas
    if (rect.top >= 0 && rect.top <= vh * 0.25) return;

    let targetY = window.scrollY + rect.top - offset;

    // clamp au max scroll
    const maxY = Math.max(0, document.documentElement.scrollHeight - vh);
    if (targetY > maxY) targetY = maxY;
    if (targetY < 0) targetY = 0;

    // évite micro-mouvements
    if (Math.abs(window.scrollY - targetY) < 6) return;

    window.scrollTo({ top: targetY, behavior: reduce ? "auto" : "smooth" });
  }

  // 1) après premier layout pass
  requestAnimationFrame(go);
  // 2) après stabilisation (images / flex / :has)
  setTimeout(go, 120);
});
