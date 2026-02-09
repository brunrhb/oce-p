document.addEventListener('DOMContentLoaded', () => {
  const DEBUG = true;          // <- mets false après
  const STRENGTH = 0.45;       // <- exagéré (0.10–0.18 en prod)
  const MAX_PX = 120;          // <- exagéré (30–60 en prod)

  const boxes = Array.from(document.querySelectorAll('[class*="placeholder"]'));
  if (DEBUG) console.log('[parallax] boxes:', boxes.length);

  if (DEBUG) {
    boxes.forEach(b => { b.style.outline = '2px dashed red'; });
  }

  function handleParallax() {
    const vh = window.innerHeight || 1;
    const viewportCenter = vh / 2;

    boxes.forEach((box) => {
      const img = box.querySelector('img');
      if (!img) return;

      // Assure un rendu “débordant” pour voir l’effet
      if (DEBUG) {
        img.style.willChange = 'transform';
        img.style.transformOrigin = 'center';
      }

      const r = box.getBoundingClientRect();
      const boxCenter = r.top + r.height / 2;

      // -1 (en bas) → +1 (en haut)
      const t = (viewportCenter - boxCenter) / vh;

      // mouvement
      const move = Math.max(-MAX_PX, Math.min(MAX_PX, t * MAX_PX * STRENGTH));

      img.style.transform = `translateY(${move}px)`;

      if (DEBUG) box.dataset.px = Math.round(move);
    });
  }

  // relance quand les images finissent de charger
  boxes.forEach((box) => {
    const img = box.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', handleParallax, { once: true });
  });

  window.addEventListener('scroll', handleParallax, { passive: true });
  window.addEventListener('resize', handleParallax, { passive: true });

  handleParallax(); // <- IMPORTANT : applique tout de suite
});
