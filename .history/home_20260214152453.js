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

  // 1. Zone réelle des titres (Bauhaus logic)
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Calcul de proximité (20px)
  const handleProximity = () => {
    if (document.body.classList.contains("has-open")) return;

    const creditsRect = credits.getBoundingClientRect();
    let isTooClose = false;

    projets.forEach(p => {
      const projetRect = p.getBoundingClientRect();
      // Distance verticale absolue entre le bloc credit et le titre
      const distance = Math.abs(creditsRect.top - projetRect.top);
      if (distance < 20) isTooClose = true;
    });

    credits.style.opacity = isTooClose ? "0" : "0.3";
    credits.style.visibility = isTooClose ? "hidden" : "visible";
  };

  // 3. Toggle global
  const toggleUI = () => {
    const isHidden = document.body.classList.contains("has-open");
    
    // Contact : On/Off
    contact.style.opacity = isHidden ? "0" : "1";
    contact.style.visibility = isHidden ? "hidden" : "visible";
    contact.style.pointerEvents = isHidden ? "none" : "auto";

    // Credits : Si ouvert -> Off, sinon -> check proximité
    if (isHidden) {
      credits.style.opacity = "0";
      credits.style.visibility = "hidden";
      credits.style.pointerEvents = "none";
    } else {
      credits.style.pointerEvents = "auto";
      handleProximity();
    }
  };

  // 4. Listeners
  const observer = new MutationObserver(() => toggleUI());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("scroll", handleProximity, { passive: true });
  document.addEventListener("project:open", toggleUI);

  toggleUI();
});