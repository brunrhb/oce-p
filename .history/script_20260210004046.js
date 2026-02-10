// script.js — open/close projects (single open at a time) + body.has-open + event

document.addEventListener("DOMContentLoaded", () => {
  const triggers = Array.from(document.querySelectorAll(".PROJET"));
  let openItem = null;

  // état initial
  document.body.classList.remove("has-open");

  triggers.forEach((t) => {
    const sel = t.getAttribute("data-target");
    const target = sel ? document.querySelector(sel) : null;
    if (!target) return;

    // tout fermé au départ
    target.classList.add("is-hidden");
    t.classList.remove("is-open");

    // a11y minimal
    t.setAttribute("role", "button");
    t.setAttribute("tabindex", "0");
    if (target.id) t.setAttribute("aria-controls", target.id);
    t.setAttribute("aria-expanded", "false");

    const close = () => {
      target.classList.add("is-hidden");
      t.classList.remove("is-open");
      t.setAttribute("aria-expanded", "false");
      document.body.classList.remove("has-open");
    };

    const open = () => {
      target.classList.remove("is-hidden");
      t.classList.add("is-open");
      t.setAttribute("aria-expanded", "true");
      document.body.classList.add("has-open");

      // pour scroll-focus.js
      document.dispatchEvent(
        new CustomEvent("project:open", { detail: { trigger: t } })
      );
    };

    const toggle = () => {
      const willOpen = target.classList.contains("is-hidden");

      // si on ouvre, on ferme l'ancien (si différent)
      if (willOpen && openItem && openItem.t !== t) {
        openItem.close();
        openItem = null;
      }

      if (willOpen) {
        open();
        openItem = { t, close };
      } else {
        close();
        openItem = null;
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
});
