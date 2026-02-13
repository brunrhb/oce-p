(() => {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const infoBox = document.querySelector(".info-boxe");
    const col2 = document.querySelector(".col-info-2");
    const img = document.querySelector(".col-info-2 .placeholder-p0 img");
    const imgWrap = document.querySelector(".col-info-2 .placeholder-p0");

    if (!infoBox || !col2) return;

    // ---------- (1) Wheel sur col2 => scroll de .info-boxe ----------
    col2.addEventListener(
      "wheel",
      (e) => {
        // si la modale info est fermée, on laisse vivre le scroll normal
        if (infoBox.classList.contains("is-hidden")) return;

        // laisser pinch/zoom trackpad (ctrlKey sur beaucoup de navigateurs)
        if (e.ctrlKey) return;

        const maxScroll = infoBox.scrollHeight - infoBox.clientHeight;
        if (maxScroll <= 0) return;

        const next = clamp(infoBox.scrollTop + e.deltaY, 0, maxScroll);
        infoBox.scrollTop = next;

        // Empêche le navigateur d’essayer de scroller autre chose (body)
        e.preventDefault();
      },
      { passive: false }
    );

    // ---------- (2) Parallax image basé sur le scroll de .info-boxe ----------
    // Idée: on utilise l’overflow vertical réel disponible (image plus grande que son cadre)
    // et on translateY progressivement (lent).
    let ticking = false;

    function computeMaxShift() {
      if (!img || !imgWrap) return 0;

      // hauteur visible du cadre (wrapper) et hauteur réelle de l'image (après scale CSS)
      const wrapH = imgWrap.clientHeight;
      const imgH = img.getBoundingClientRect().height;

      // si l'image est plus grande que le cadre, on peut la "promener"
      return Math.max(0, imgH - wrapH);
    }

    function applyParallax() {
      ticking = false;
      if (!img || infoBox.classList.contains("is-hidden")) return;

      const maxScroll = infoBox.scrollHeight - infoBox.clientHeight;
      if (maxScroll <= 0) {
        img.style.transform = "translateY(0px)";
        return;
      }

      const t = infoBox.scrollTop / maxScroll; // 0..1

      // amplitude = overflow dispo * facteur de lenteur
      // (0.35 = parallax “lent” ; ajuste entre 0.2 et 0.6)
      const maxShift = computeMaxShift() * 0.35;

      // déplace l'image vers le haut quand on scrolle vers le bas
      const y = -maxShift * t;

      // IMPORTANT: si tu scales l’image en CSS, on évite d’écraser ce scale.
      // Donc: mets ton scale en CSS sur l'image via transform: scale(...)
      // et ici on gère uniquement translateY via une variable CSS (voir note ci-dessous)
      img.style.setProperty("--info-parallax-y", `${y}px`);
    }

    function requestParallaxUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyParallax);
    }

    // écoute le scroll du conteneur scrollable
    infoBox.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);

    // premier calcul
    requestParallaxUpdate();
  });
})();
