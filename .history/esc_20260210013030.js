// esc.js — click outside (hors lien) + Escape = fermer le projet ouvert
// + synchronise body.has-open

document.addEventListener("DOMContentLoaded", () => {
  function getOpenTrigger() {
    return document.querySelector(".PROJET.is-open");
  }

  function closeOpenProject() {
    const t = getOpenTrigger();
    if (!t) return;

    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;

    if (target) target.classList.add("is-hidden");
    t.classList.remove("is-open");
    t.setAttribute("aria-expanded", "false");

    // IMPORTANT : remettre l'état OFF
    document.body.classList.remove("has-open");
  }

  // ESC ferme
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOpenProject();
  });

  // Click global ferme (sauf lien et sauf clic sur un titre de projet)
  document.addEventListener("click", (e) => {
    if (!getOpenTrigger()) return;

    if (e.target.closest("a")) return;        // ne pas fermer si lien
    if (e.target.closest(".PROJET")) return;  // le toggle gère déjà

    closeOpenProject();
  });
});
