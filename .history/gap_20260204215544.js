(() => {
  const SELECTORS = {
    section: "#projet1",
    grid: "#projet1 .grid-p1s2",
    mediaBlock: "#projet1 .media-block-p1s2-2",
    bodyStart: '#projet1 .col-p1s2-2 .extrait[data-content="p1s2-extrait1"]',
  };

  const isVisible = (el) => !!el && el.offsetParent !== null;

  function computeAndApply() {
    const section = document.querySelector(SELECTORS.section);
    if (!section || section.classList.contains("is-hidden")) return;

    const grid = document.querySelector(SELECTORS.grid);
    const media = document.querySelector(SELECTORS.mediaBlock);
    const body = document.querySelector(SELECTORS.bodyStart);
    if (!isVisible(grid) || !isVisible(media) || !isVisible(body)) return;

    const mediaTop = media.getBoundingClientRect().top;
    const bodyTop = body.getBoundingClientRect().top;

    const offset = Math.max(0, Math.round(bodyTop - mediaTop));
    grid.style.setProperty("--extrait-offset", `${offset}px`);
  }

  function schedule() {
    requestAnimationFrame(() => requestAnimationFrame(computeAndApply));
  }

  // 1) au chargement + quand les fonts sont prêtes
  window.addEventListener("load", schedule, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(schedule);

  // 2) resize
  window.addEventListener("resize", schedule, { passive: true });

  // 3) si content.js réinjecte du texte, on suit
  const body = document.querySelector(SELECTORS.bodyStart);
  const title = document.querySelector("#projet1 .extrait-titre");
  const mo = new MutationObserver(schedule);
  if (body) mo.observe(body, { childList: true, characterData: true, subtree: true });
  if (title) mo.observe(title, { childList: true, characterData: true, subtree: true });

  // 4) si la taille change (wrap, etc.)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(schedule);
    const grid = document.querySelector(SELECTORS.grid);
    if (grid) ro.observe(grid);
    if (body) ro.observe(body);
    if (title) ro.observe(title);
  }

  // 5) au cas où l’ouverture/fermeture change l’affichage
  document.addEventListener("click", schedule, true);
})();
