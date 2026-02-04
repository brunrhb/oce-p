(() => {
  const GRID  = '#projet1 .grid-p1s2';
  const MEDIA = '#projet1 .media-block-p1s2-2';
  const BODY1 = '#projet1 .extrait[data-content="p1s2-extrait1"]'; // "Nos corps..."

  function apply() {
    const grid  = document.querySelector(GRID);
    const media = document.querySelector(MEDIA);
    const body1 = document.querySelector(BODY1);
    if (!grid || !media || !body1) return;

    // 1) reset pour mesurer une base stable
    grid.style.setProperty('--extrait-offset', '0px');

    // 2) force layout
    void grid.offsetHeight;

    // 3) calc : amener mediaTop au niveau de bodyTop
    const offset = Math.max(
      0,
      Math.round(body1.getBoundingClientRect().top - media.getBoundingClientRect().top)
    );

    grid.style.setProperty('--extrait-offset', `${offset}px`);
  }

  window.addEventListener('load', apply);
  if (document.fonts?.ready) document.fonts.ready.then(apply);
  window.addEventListener('resize', () => requestAnimationFrame(apply));

  document.addEventListener('click', (e) => {
    if (e.target.closest('.PROJET')) requestAnimationFrame(apply);
  });
})();
