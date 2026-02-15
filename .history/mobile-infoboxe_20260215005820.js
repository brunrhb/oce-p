/*
  mobile-infoboxe.js
  ------------------------------------------------------------
  Mobile-only simplification de la section "infos" (.info-boxe).

  Ce script NE TOUCHE PAS aux projets.
  Il injecte uniquement des overrides CSS ciblés sur .info-boxe en <800px.

  Spécifications (selon tes consignes) :
  - Reprend les marges mobile (mêmes valeurs que celles validées)
  - Texte un peu plus petit sur mobile (pas trop)
  - Colonne texte élargie (en laissant une place à l'image fixe)
  - Colonne texte descend (commence ~1 spacer sous "bio")
  - Image reste fixed "background" : height 50vh, width 40vw
  - Conserve le dégradé + augmente visibilité de l'image (~+20%)
*/

(() => {
  "use strict";

  const BREAKPOINT = 800;
  const STYLE_ID = "mobile-infoboxe-style";

  const isMobile = () => window.innerWidth < BREAKPOINT;

  const ensureStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
@media (max-width: ${BREAKPOINT}px) {
  /* Marges mobiles (scopées à la info-boxe pour ne rien casser ailleurs) */
  .info-boxe{
    --m-left: clamp(26px, 9vw, 44px);
    --m-right: clamp(14px, 5vw, 26px);
  }

  /* Layout global: une seule colonne + image fixe à droite */
  .info-boxe .grid-info{
    margin-left: var(--m-left) !important;
    margin-right: var(--m-right) !important;
    /* descendre la colonne texte sous "bio" */
    margin-top: calc(var(--m-top) + 32px) !important;

    grid-template-columns: 1fr !important;
    column-gap: 0 !important;

    height: auto !important;
    min-height: calc(100vh - var(--m-top)) !important;
  }

  /* Colonne texte: plus large + réserve place pour l'image fixed */
  .info-boxe .col-info-1{
    padding-right: calc(40vw + 14px) !important;
    max-width: none !important;
  }

  /* Texte: un peu plus petit (mais pas "tiny") */
  .info-boxe .info-body{
    font-size: clamp(14px, 3.55vw, 17px) !important;
    line-height: 1.25 !important;
  }

  /* Image fixed: 40vw x 50vh */
  .info-boxe .col-info-2{
    position: fixed !important;
    top: calc(var(--m-top) + 18px) !important;
    right: var(--m-right) !important;
    left: auto !important;

    width: 40vw !important;
    height: 50vh !important;
    min-height: 50vh !important;

    z-index: 500 !important;
    overflow: hidden !important;
    pointer-events: none;
  }

  .info-boxe .col-info-2 .holder-p0{
    width: 100% !important;
    height: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  /* + visibilité image (~+20%) */
  .info-boxe .col-info-2 .holder-p0 img{
    opacity: 0.92 !important; /* + visible */
  }

  /* Dégradé gardé mais moins "blanc" en bas */
  .info-boxe .col-info-2 .fading::after{
    background: linear-gradient(to bottom,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.85) 100%
    ) !important;
  }
}
`;
    document.head.appendChild(style);
  };

  const apply = () => {
    if (!isMobile()) return;
    ensureStyle();
  };

  // init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  // si tu redimensionnes (devtools)
  window.addEventListener("resize", () => {
    if (isMobile()) ensureStyle();
  });
})();
