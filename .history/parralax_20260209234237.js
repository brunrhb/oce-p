document.addEventListener('DOMContentLoaded', () => {
  console.log('[parralax] loaded');

  const boxes = [...document.querySelectorAll('[class*="placeholder"]')];
  console.log('[parralax] boxes', boxes.length);
  boxes.forEach(b => b.style.outline = '2px dashed red');

  function handleParallax() {
    const vh = window.innerHeight || 1;
    const center = vh / 2;
    boxes.forEach(box => {
      const img = box.querySelector('img');
      if (!img) return;
      const r = box.getBoundingClientRect();
      const t = (center - (r.top + r.height/2)) / vh;
      const move = Math.max(-140, Math.min(140, t * 140));
      img.style.transform = `translateY(${move}px)`;
    });
  }

  window.addEventListener('scroll', handleParallax, { passive: true });
  window.addEventListener('resize', handleParallax, { passive: true });
  handleParallax();
});
