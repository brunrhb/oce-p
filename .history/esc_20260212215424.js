// esc.js — click outside (hors lien) + Escape = fermer
// + micro-signe "↩" sur le titre ouvert

document.addEventListener("DOMContentLoaded", () => {
  const SIGN = "—";                 // change si tu veux "×" ou "⟲"
  const SIGN_CLASS = "micro-retour";

  function getOpenTrigger() {
    return document.querySelector(".PROJET.is-open, .js-modal.is-open");
  }

  function clearSigns() {
    document.querySelectorAll(`.${SIGN_CLASS}`).forEach((el) => el.remove());
  }

  function applySign(trigger) {
    if (!trigger) return;
    // évite doublons
    if (trigger.querySelector(`.${SIGN_CLASS}`)) return;

    const span = document.createElement("span");
    span.className = SIGN_CLASS;
    span.setAttribute("aria-hidden", "true");
    span.textContent = ` ${SIGN}`; // espace avant le signe
    trigger.appendChild(span);
  }

  function syncSignWithState() {
    clearSigns();
    const open = getOpenTrigger();
    if (open) applySign(open);
  }

  function closeOpenProject() {
    const t = getOpenTrigger();
    if (!t) return;

    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;

    if (target) target.classList.add("is-hidden");
    t.classList.remove("is-open");
    t.setAttribute("aria-expanded", "false");

    // état OFF
    document.body.classList.remove("has-open");
    syncSignWithState();
  }

  // ESC ferme
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOpenProject();
  });

  // Click global ferme (sauf lien et sauf clic sur un titre de projet)
  document.addEventListener("click", (e) => {
    if (!getOpenTrigger()) return;

    if (e.target.closest("a")) return;
    if (e.target.closest(".PROJET")) {
      // le toggle du titre va gérer open/close → on resync après
      setTimeout(syncSignWithState, 0);
      return;
    }

    closeOpenProject();
  });

  // Quand script.js ouvre un projet, on sync (tu dispatch déjà "project:open")
  document.addEventListener("project:open", () => {
    setTimeout(syncSignWithState, 0);
  });

  // état initial
  syncSignWithState();
});
