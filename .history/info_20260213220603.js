/**
 * info.js — comportement dédié à la modale/section "info"
 *
 * Attendus côté DOM (noms actuels) :
 * - conteneur scrollable: .info-boxe
 * - colonne fixe: .col-info-2
 * - wrapper image: .col-info-2 .holder-p0  (ou .placeholder-p0 si tu changes)
 * - image: <img> dans ce wrapper
 *
 * Attendus côté CSS (ex) :
 * .col-info-2 { --info-parallax-strength: .35; }
 * .col-info-2 img { transform: translate(..., calc(var(--img-shift-y) + var(--info-parallax-y))) scale(...); }
 */

(() => {
  const SELECTORS = {
    infoBox: ".info-boxe",
    col2: ".col-info-2",
    imgWrap: ".col-info-2 .holder-p0, .col-info-2 .placeholder-p0",
  };

  const DEFAULTS = {
    strength: 0.35, // parallax "lent"
    cssVarY: "--info-parallax-y",
    cssVarStrength: "--info-parallax-strength",
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function isHidden(el) {
    // tu utilises déjà .is-hidden dans ton projet
    return el.classList.contains("is-hidden");
  }

  function readStrength(col2) {
    const raw = getComputedStyle(col2)
      .getPropertyValue(DEFAULTS.cssVarStrength)
      .trim();
    const v = Number.parseFloat(raw);
    return Number.isFinite(v) ? v : DEFAULTS.strength;
  }

  function setParallaxY(targetEl, pxString) {
    targetEl.style.setProperty(DEFAULTS.cssVarY, pxString);
  }

  /**
   * Calcule combien on peut "promener" l'image verticalement
   * (diff entre hauteur réelle rendue de l'image (incl. scale) et hauteur du cadre)
   */
  function computeMaxTravel(imgWrap, img) {
    if (!imgWrap || !img) return 0;

    const wrapH = imgWrap.clientHeight;
    const imgH = img.getBoundingClientRect().height;

    return Math.max(0, imgH - wrapH);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const infoBox = document.querySelector(SELECTORS.infoBox);
    const col2 = document.querySelector(SELECTORS.col2);
    const imgWrap = document.querySelector(SELECTORS.imgWrap);
    const img = imgWrap ? imgWrap.querySelector("img") : null;

    if (!infoBox || !col2) return;

    // --- 1) Scroll depuis col2 vers le conteneur scrollable (col1) ---
    function onWheelOverCol2(e) {
      // si la modale info est fermée, on ne force rien
      if (isHidden(infoBox)) return;

      // laisser le pinch/zoom trackpad (souvent ctrlKey=true)
      if (e.ctrlKey) return;

      const maxScroll = infoBox.scrollHeight - infoBox.clientHeight;
      if (maxScroll <= 0) return;

      // Forward du scroll vertical vers infoBox
      const next = clamp(infoBox.scrollTop + e.deltaY, 0, maxScroll);
      infoBox.scrollTop = next;

      // évite que le navigateur scrolle body/autre chose
      e.preventDefault();
    }

    col2.addEventListener("wheel", onWheelOverCol2, { passive: false });

    // --- 2) Parallax dédié ---
    // On met la variable sur imgWrap si possible (plus local), sinon sur col2.
    const parallaxTarget = imgWrap || col2;

    let ticking = false;

    function applyParallax() {
      ticking = false;

      if (isHidden(infoBox)) {
        setParallaxY(parallaxTarget, "0px");
        return;
      }
      if (!imgWrap || !img) return;

      const maxScroll = infoBox.scrollHeight - infoBox.clientHeight;
      if (maxScroll <= 0) {
        setParallaxY(parallaxTarget, "0px");
        return;
      }

      const t = infoBox.scrollTop / maxScroll; // 0..1
      const strength = readStrength(col2);

      const travel = computeMaxTravel(imgWrap, img);
      const maxShift = travel * strength;

      // vers le haut quand on scrolle vers le bas
      const y = -maxShift * t;

      setParallaxY(parallaxTarget, `${y}px`);
    }

    function requestParallax() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyParallax);
    }

    // scroll du conteneur (col1)
    infoBox.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);

    // important: recalcul après chargement image (sinon bbox pas bonne)
    if (img) {
      if (img.complete) {
        requestParallax();
      } else {
        img.addEventListener("load", requestParallax, { once: true });
      }
    }

    // init
    requestParallax();
  });
})();
