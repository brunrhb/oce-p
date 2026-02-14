document.addEventListener("DOMContentLoaded", () => {
  const contact = document.querySelector(".home-contact");
  const credits = document.querySelector(".info-credit");
  const projets = document.querySelectorAll(".PROJET");

  if (!contact || !credits) return;

  // 1. Fix zone réelle des titres (Bauhaus/Poster logic)
  // On limite l'interaction au texte pour ne pas bloquer le reste de la ligne
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Gestion de l'affichage (Toggle)
  const toggleUI = () => {
    const isHidden = document.body.classList.contains("has-open");
    
    // On applique l'état aux deux blocs d'UI
    [contact, credits].forEach(el => {
      el.style.opacity = isHidden ? "0" : (el === credits ? "0.3" : "1");
      el.style.visibility = isHidden ? "hidden" : "visible";
      el.style.pointerEvents = isHidden ? "none" : "auto";
    });
  };

  // 3. Écouteurs d'événements
  // MutationObserver pour détecter le changement de classe sur le body (via esc.js ou script.js)
  const observer = new MutationObserver(() => toggleUI());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Événement personnalisé déclenché à l'ouverture (via script.js)
  document.addEventListener("project:open", toggleUI);

  // Initialisation au chargement
  toggleUI();
});






document.addEventListener("DOMContentLoaded", () => {
  const credits = document.querySelector(".info-credit");
  const projets = document.querySelectorAll(".PROJET");

  if (!contact || !credits) return;

  // 1. Fix zone réelle des titres (Bauhaus logic)
  // On s'assure que les lettres ne bavent pas sur toute la ligne
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Fonction de visibilité globale
  const updateVisibility = () => {
    const isProjectOpen = document.body.classList.contains("has-open");
    const isSmallScreen = window.innerWidth < 1000;

    // Si l'une des deux conditions est vraie, on cache tout
    if (isProjectOpen || isSmallScreen) {
      [contact, credits].forEach(el => {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
      });
    } else {
      // Sinon, on affiche avec les opacités respectives
      contact.style.opacity = "1";
      credits.style.opacity = "0.3";
      [contact, credits].forEach(el => {
        el.style.visibility = "visible";
        el.style.pointerEvents = "auto";
      });
    }
  };

  // 3. Listeners
  // Changement de taille de fenêtre
  window.addEventListener("resize", updateVisibility);

  // Ouverture de projet (via ton CustomEvent)
  document.addEventListener("project:open", updateVisibility);

  // Changement d'état sur le body (Fermeture via Escape ou clic)
  const observer = new MutationObserver(() => updateVisibility());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Init au lancement
  updateVisibility();
});