// esc.js — click outside (hors lien) + Escape = fermer le projet ouvert

document.addEventListener("DOMContentLoaded", () => {
  function getOpenTrigger() {
    return document.querySelector(".PROJET.is-open");
  }

  function closeOpenProject() {
    const t = getOpenTrigger();
    if (!t) return;

    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;

    // ferme
    if (target) target.classList.add("is-hidden");
    t.classList.remove("is-open");
    t.setAttribute("aria-expanded", "false");
  }

  // 1) ESC ferme
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOpenProject();
  });

  // 2) Click global ferme (sauf lien et sauf clic sur un titre de projet)
  document.addEventListener("click", (e) => {
    if (!getOpenTrigger()) return;

    // ne pas fermer si click sur un lien (ou dans un lien)
    if (e.target.closest("a")) return;

    // ne pas fermer si click sur un titre .PROJET (le toggle gère déjà)
    if (e.target.closest(".PROJET")) return;

    closeOpenProject();
  });
});
