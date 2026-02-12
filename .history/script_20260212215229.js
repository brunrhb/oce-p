document.addEventListener("DOMContentLoaded", () => {
  const triggers = Array.from(document.querySelectorAll(".PROJET, .js-modal"));
  let openTrigger = null;

  // état initial
  document.body.classList.remove("has-open");

  function closeTrigger(t) {
    if (!t) return;
    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;
    if (target) target.classList.add("is-hidden");
    t.classList.remove("is-open");
    t.setAttribute("aria-expanded", "false");
  }

  function openTriggerFn(t) {
    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;
    if (!target) return;

    target.classList.remove("is-hidden");
    t.classList.add("is-open");
    t.setAttribute("aria-expanded", "true");

    document.body.classList.add("has-open");
    document.dispatchEvent(new CustomEvent("project:open", { detail: { trigger: t } }));
  }

  triggers.forEach((t) => {
    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;
    if (!target) return;

    // tout fermé
    target.classList.add("is-hidden");
    t.classList.remove("is-open");

    t.setAttribute("role", "button");
    t.setAttribute("tabindex", "0");
    if (target.id) t.setAttribute("aria-controls", target.id);
    t.setAttribute("aria-expanded", "false");

    const toggle = () => {
      const willOpen = target.classList.contains("is-hidden");

      // ferme l'ancien si on ouvre un autre
      if (willOpen && openTrigger && openTrigger !== t) {
        closeTrigger(openTrigger);
        openTrigger = null;
      }

      if (willOpen) {
        openTriggerFn(t);
        openTrigger = t;
      } else {
        closeTrigger(t);
        openTrigger = null;
        document.body.classList.remove("has-open");
      }
    };

    t.addEventListener("click", toggle);
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // au cas où (sécurité) : si rien n'est ouvert, on enlève has-open
  if (!document.querySelector(".PROJET.is-open")) {
    document.body.classList.remove("has-open");
  }
});
