// parralax.js — version subtile (sans repères / sans debug)

document.addEventListener('DOMContentLoaded', () => {
  const boxes = Array.from(document.querySelectorAll('[class*="placeholder"]'));
  if (!boxes.length) return;

  // Réglages (subtil)
  const STRENGTH = 0.12; // 0.10–0.16
  const MAX_PX = 48;     // 30–60

  function handleParallax() {
    const vh = window.innerHeight || 1;
    const center = vh / 2;

    boxes.forEach((box) => {
      const img = box.querySelector('img');
      if (!img) return;

      // Le conteneur doit masquer le débordement
      box.style.overflow = 'hidden';

      const r = box.getBoundingClientRect();
      const boxCenter = r.top + r.height / 2;

      // -1 (bas) → +1 (haut)
      const t = (center - boxCenter) / vh;

      // amplitude liée à l'image, avec limite MAX_PX
      const imgH = img.getBoundingClientRect().height || img.naturalHeight || 0;
      const maxMove = Math.min(MAX_PX, (imgH * 0.15) / 2);

      const move = Math.max(-maxMove, Math.min(maxMove, t * maxMove * (1 / STRENGTH) * STRENGTH));
      img.style.willChange = 'transform';
      img.style.transform = `translateY(${move}px)`;
    });
  }

  // RAF-throttle (plus smooth)
  let ticking = false;
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      handleParallax();
      ticking = false;
    });
  }

  // Relance après chargement des images
  boxes.forEach((box) => {
    const img = box.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', requestUpdate, { once: true });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  handleParallax();
});
