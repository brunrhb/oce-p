document.addEventListener('DOMContentLoaded', () => {
  // Sélecteur des titres cliquables
  const triggers = document.querySelectorAll('.PROJET');

  triggers.forEach((t) => {
    const targetSelector = t.getAttribute('data-target');
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    // état initial: caché
    target.classList.add('is-hidden');

    // accessibilité de base
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-controls', target.id);
    t.setAttribute('aria-expanded', 'false');

    const toggle = () => {
      const isHidden = target.classList.toggle('is-hidden');
      t.setAttribute('aria-expanded', String(!isHidden));
    };

    t.addEventListener('click', toggle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  const images = document.querySelectorAll('[class*="placeholder"] img');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    images.forEach((img) => {
      const parent = img.closest('[class*="placeholder"]');
      const rect = parent.getBoundingClientRect();

      // Only apply effect when image is in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Calculate how far the image container is from top of viewport
        const distance = (window.innerHeight - rect.top) / window.innerHeight;
        // Move image slightly based on scroll position
        const move = distance * 10; // 10px maximum movement

        img.style.transform = `translateY(${move}px)`;
      }
    });
  });
});
