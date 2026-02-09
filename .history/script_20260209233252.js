document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.PROJET');
  let openItem = null;

  triggers.forEach((t) => {
    const targetSelector = t.getAttribute('data-target');
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    // état initial : tout fermé (si pas déjà)
    target.classList.add('is-hidden');

    const close = () => {
      target.classList.add('is-hidden');
      t.classList.remove('is-open');
    };

    const open = () => {
      target.classList.remove('is-hidden');
      t.classList.add('is-open');
      document.dispatchEvent(new CustomEvent("project:open", { detail: { trigger: t } }));

    };

    const toggle = () => {
      const isOpening = target.classList.contains('is-hidden');

      if (isOpening && openItem && openItem.t !== t) {
        openItem.close();
      }

      if (isOpening) {
        open();
        openItem = { t, close };
      } else {
        close();
        openItem = null;
      }
    };

    t.addEventListener('click', toggle);
  });
});
