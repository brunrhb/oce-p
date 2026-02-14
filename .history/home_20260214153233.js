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
  const contact = document.querySelector(".home-contact");
  const credits = document.querySelector(".info-credit");
  const projets = document.querySelectorAll(".PROJET");

  if (!contact || !credits) return;

  // 1. Fix zone réelle des titres
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Gestion de la visibilité
  const updateVisibility = () => {
    const isProjectOpen = document.body.classList.contains("has-open");
    const isSmallScreen = window.innerWidth < 1000;

    // Logique CONTACT : disparaît seulement si projet ouvert
    if (isProjectOpen) {
      contact.style.opacity = "0";
      contact.style.visibility = "hidden";
      contact.style.pointerEvents = "none";
    } else {
      contact.style.opacity = "1";
      contact.style.visibility = "visible";
      contact.style.pointerEvents = "auto";
    }

    // Logique CREDITS : disparaît si projet ouvert OU écran < 1000px
    if (isProjectOpen || isSmallScreen) {
      credits.style.opacity = "0";
      credits.style.visibility = "hidden";
      credits.style.pointerEvents = "none";
    } else {
      credits.style.opacity = "0.3";
      credits.style.visibility = "visible";
      credits.style.pointerEvents = "auto";
    }
  };

  // 3. Listeners
  window.addEventListener("resize", updateVisibility);
  document.addEventListener("project:open", updateVisibility);
  
  const observer = new MutationObserver(() => updateVisibility());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Init
  updateVisibility();
});