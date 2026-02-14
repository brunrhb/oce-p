document.addEventListener("DOMContentLoaded", () => {
  const contact = document.querySelector(".home-contact");
  const projets = document.querySelectorAll(".PROJET");

  if (!contact) return;

  // Fix zone réelle des titres
  projets.forEach(p => {
    p.style.width = "fit-content";
    p.style.display = "block";
  });

  const toggleContact = () => {
    if (document.body.classList.contains("has-open")) {
      contact.style.opacity = "0";
      contact.style.visibility = "hidden";
      contact.style.pointerEvents = "none";
    } else {
      contact.style.opacity = "1";
      contact.style.visibility = "visible";
      contact.style.pointerEvents = "auto";
    }
  };

  // Écoute des changements d'état via le body
  const observer = new MutationObserver(() => toggleContact());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Sécurité sur l'event spécifique
  document.addEventListener("project:open", toggleContact);
});