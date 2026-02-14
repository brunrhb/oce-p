document.addEventListener("DOMContentLoaded", () => {
  const contact = document.querySelector(".home-contact");
  const credits = document.querySelector(".credit-typo"); // Ton nom de classe actuel
  const projets = document.querySelectorAll(".PROJET");

  if (!contact || !credits) return;

  // 1. Fix zone réelle des titres (Bauhaus logic)
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  // 2. Gestion de la collision (100px)
  const handleCollision = () => {
    if (document.body.classList.contains("has-open")) return;

    const creditsRect = credits.getBoundingClientRect();
    let isTooClose = false;

    projets.forEach(p => {
      const projetRect = p.getBoundingClientRect();
      
      // Distance verticale entre le bloc credits et le titre
      const distance = Math.abs(creditsRect.top - projetRect.top);
      
      if (distance < 100) {
        isTooClose = true;
      }
    });

    credits.style.opacity = isTooClose ? "0" : "0.3";
    credits.style.visibility = isTooClose ? "hidden" : "visible";
  };

  // 3. Toggle global Ouverture/Fermeture
  const toggleUI = () => {
    const isHidden = document.body.classList.contains("has-open");

    // Contact
    contact.style.opacity = isHidden ? "0" : "1";
    contact.style.visibility = isHidden ? "hidden" : "visible";
    contact.style.pointerEvents = isHidden ? "none" : "auto";

    // Crédit Typo
    if (isHidden) {
      credits.style.opacity = "0";
      credits.style.visibility = "hidden";
      credits.style.pointerEvents = "none";
    } else {
      credits.style.pointerEvents = "auto";
      handleCollision(); 
    }
  };

  // 4. Listeners
  const observer = new MutationObserver(() => toggleUI());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("scroll", handleCollision, { passive: true });
  document.addEventListener("project:open", toggleUI);

  // Init
  toggleUI();
});