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

  // 1. Force la zone réelle sur les titres
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Logique de collision sur les LETTRES (Proximité 20px)
  const handleProximity = () => {
    if (document.body.classList.contains("has-open")) return;

    const creditsRect = credits.getBoundingClientRect();
    let isTooClose = false;

    projets.forEach(p => {
      // On prend le rect du texte lui-même, pas de la div invisible
      const projetRect = p.getBoundingClientRect();
      
      // On compare le haut/bas du texte avec le bloc crédit
      const overlapY = !(creditsRect.bottom + 20 < projetRect.top || 
                         creditsRect.top - 20 > projetRect.bottom);
      
      // Optionnel : vérifier aussi l'alignement horizontal si besoin
      // Ici on reste sur une collision verticale stricte (20px)
      if (overlapY) isTooClose = true;
    });

    credits.style.opacity = isTooClose ? "0" : "0.3";
    credits.style.visibility = isTooClose ? "hidden" : "visible";
  };

  // 3. Toggle global
  const toggleUI = () => {
    const isHidden = document.body.classList.contains("has-open");
    
    contact.style.opacity = isHidden ? "0" : "1";
    contact.style.visibility = isHidden ? "hidden" : "visible";
    contact.style.pointerEvents = isHidden ? "none" : "auto";

    if (isHidden) {
      credits.style.opacity = "0";
      credits.style.visibility = "hidden";
    } else {
      handleProximity();
    }
  };

  const observer = new MutationObserver(() => toggleUI());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("scroll", handleProximity, { passive: true });
  document.addEventListener("project:open", toggleUI);

  toggleUI();
});