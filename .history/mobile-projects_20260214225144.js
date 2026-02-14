/*
  mobile-projects.js
  ------------------------------------------------------------
  Objectif : sur mobile (<800px), remplacer le contenu des sections
  #projet1..#projet9 par une version "mobile" réorganisée.

  Contraintes STRICTES respectées :
  - Ne touche PAS aux titres de projets (.PROJET) : on ne modifie que les <section id="projetX">.
  - Ne change PAS le contenu texte : on clone les noeuds existants.
  - Ne change PAS les classes / styles existants : on garde les noeuds clonés.
  - Ajoute uniquement un wrapper mobile + CSS inline dédié.
  - Crédit = taille x3 en mobile.
  - Sliders en scroll-snap natif (zéro dépendance).
  - Embed YouTube mobile-only pour projet4.

  Dépendances : aucune.
  S'intègre avec : .is-hidden toggle + body.has-open (déjà existants).
*/

(() => {
  "use strict";

  const BREAKPOINT = 800;
  const STYLE_ID = "mobile-projects-style";
  const WRAP_CLASS = "mproj-wrap";

  // Cache original DOM pour restore
  /** @type {Map<HTMLElement, {html: string, had: boolean}>} */
  const original = new Map();

  // --- Utils -------------------------------------------------

  const isMobile = () => window.innerWidth < BREAKPOINT;

  const q = (root, sel) => (root ? root.querySelector(sel) : null);
  const qa = (root, sel) => (root ? Array.from(root.querySelectorAll(sel)) : []);

  const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const ensureStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
@media (max-width: ${BREAKPOINT}px) {
  .${WRAP_CLASS}{
    display:flex;
    flex-direction:column;
    gap: 0;
  }

  /* On masque le layout desktop original uniquement quand la version mobile est active */
  .mproj-desktop-hidden{ display:none !important; }

  /* Notes / crédits : override propre (on se détache du clamp desktop)
     Objectif : lisible, présent, mais pas énorme. */
  .mproj-credit-3x{
    font-size: clamp(18px, 5.5vw, 28px) !important;
    line-height: 1.05;
  }

  /* Media blocks */
  .mproj-media{ display:flex; flex-direction:column; gap: 10px; }

  /* Ratio wrappers */
  .mproj-ratio{ position:relative; overflow:hidden; background:white; }
  .mproj-ratio > *{ position:absolute; inset:0; width:100%; height:100%; }
  .mproj-ratio img, .mproj-ratio video{ width:100%; height:100%; object-fit:cover; display:block; }

  .mproj-1x1{ aspect-ratio: 1 / 1; }
  .mproj-2x3{ aspect-ratio: 2 / 3; }
  .mproj-3x2{ aspect-ratio: 3 / 2; }

  /* Slider (scroll-snap natif) */
  .mproj-slider{
    display:flex;
    overflow-x:auto;
    scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 10px;
    padding-bottom: 6px;
  }
  .mproj-slide{
    flex: 0 0 100%;
    scroll-snap-align: start;
  }

  /* Spacers (ajoutés par JS entre certains blocs) */
  .mproj-spacer{ width:100%; }
  .mproj-spacer-sm{ height: clamp(10px, 3vw, 16px); }
  .mproj-spacer-md{ height: clamp(16px, 4vw, 26px); }
  .mproj-spacer-lg{ height: clamp(22px, 6vw, 38px); }

  /* Embed YouTube responsive */
  .mproj-yt{ position:relative; width:100%; aspect-ratio: 16 / 9; overflow:hidden; background:black; }
  .mproj-yt iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
}
`;
    document.head.appendChild(style);
  };

  /** Retourne la section projet actuellement visible (open) */
  const getOpenProjectSection = () => {
    // on se base sur le fait qu'une seule section projet est visible quand open
    const secs = qa(document, "section[id^='projet']");
    return secs.find((s) => !s.classList.contains("is-hidden")) || null;
  };

  const snapshot = (section) => {
    if (original.has(section)) return;
    original.set(section, {
      html: section.innerHTML,
      had: section.classList.contains("mproj-has-mobile"),
    });
  };

  const restore = (section) => {
    const rec = original.get(section);
    if (!rec) return;
    section.innerHTML = rec.html;
    section.classList.remove("mproj-has-mobile");
    original.delete(section);
  };

  // --- DOM builders ------------------------------------------

  const addSpacer = (parent, size = "md") => {
    const d = document.createElement("div");
    d.className = `mproj-spacer mproj-spacer-${size}`;
    parent.appendChild(d);
  };

  const wrapRatio = (node, ratioClass) => {
    const w = document.createElement("div");
    w.className = `mproj-ratio ${ratioClass}`;

    // si c'est un placeholder avec img dedans, on garde le placeholder (parallax)
    // et on l'insère tel quel (cloné). Sinon, on insère le node.
    w.appendChild(node);
    return w;
  };

  const buildMediaBlock = ({ items, ratio, slider }) => {
    const container = document.createElement("div");
    container.className = "mproj-media";

    const ratioClass = ratio === "1/1" ? "mproj-1x1" : ratio === "2/3" ? "mproj-2x3" : "mproj-3x2";

    if (slider) {
      const sc = document.createElement("div");
      sc.className = "mproj-slider";
      items.forEach((it) => {
        const slide = document.createElement("div");
        slide.className = "mproj-slide";
        slide.appendChild(wrapRatio(it, ratioClass));
        sc.appendChild(slide);
      });
      container.appendChild(sc);
    } else {
      items.forEach((it) => container.appendChild(wrapRatio(it, ratioClass)));
    }
    return container;
  };

  const buildYouTubeEmbed = (url) => {
    const yt = document.createElement("div");
    yt.className = "mproj-yt";

    // Support watch?v=... et shorts/... et youtu.be/...
    const id = (() => {
      try {
        const u = new URL(url, window.location.href);
        if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
        if (u.pathname.includes("/shorts/")) return u.pathname.split("/shorts/")[1].split("/")[0];
        const v = u.searchParams.get("v");
        return v || "";
      } catch {
        return "";
      }
    })();

    // embed privacy-friendly
    const src = id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    yt.appendChild(iframe);
    return yt;
  };

  // --- Project-specific extractors ----------------------------

  // Helper: clone nodes by selectors, keep original classes/content
  const cloneOne = (section, selector) => {
    const el = q(section, selector);
    return el ? el.cloneNode(true) : null;
  };
  const cloneMany = (section, selector) => qa(section, selector).map((el) => el.cloneNode(true));

  // Helper: clone placeholders (keeps parallax behavior because CSS targets [class*="placeholder"])
  const clonePlaceholders = (section) => cloneMany(section, "[class*='placeholder']");

  // Credits helper: apply x3 on the cloned credit element
  const markCredit3x = (node) => {
    if (!node) return node;
    node.classList.add("mproj-credit-3x");
    return node;
  };

  // --- Rules mapping (exactement selon tes specs) --------------

  /**
   * Chaque entrée retourne un DocumentFragment contenant
   * uniquement le contenu mobile (sans toucher au titre projet).
   */
  const RULES = {
    projet1: (section) => {
      // LIAISONS VÉGÉTALES:
      // Extrait titre -> Extrait body (2 blocs) -> Crédit x3 -> Image(s) 3/2 (pas slider)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: images, ratio: "3/2", slider: false }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet2: (section) => {
      // PANSER:
      // Protocole titre (taille extrait titre) -> protocole corps
      // Extrait titre -> Extrait body -> Crédit x3 -> Image 1/1
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const protocTitre = cloneOne(section, ".protocole-titre");
      // taille = extrait-titre : on ajoute la classe extrait-titre (sans enlever protocole)
      if (protocTitre) protocTitre.classList.add("extrait-titre");

      const protocCorps = cloneOne(section, ".protocole-corps");
      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocCorps) wrap.appendChild(protocCorps);
      if (extraitTitre) {
        addSpacer(wrap, "lg");
        wrap.appendChild(extraitTitre);
      }
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }
      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet3: (section) => {
      // AUX MORNES:
      // Intro (taille extrait titre) -> Body -> Notes (taille credit*3) -> IMG IMG (1/1 slider)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const intro = cloneOne(section, ".intro");
      if (intro) intro.classList.add("extrait-titre");

      // Body : on prend les blocs .context/.autre-corps (deux colonnes) dans l'ordre DOM
      const bodies = cloneMany(section, ".context");

      // Notes : tu as biblio + credit. On prend en priorité .biblio (p3-biblio) sinon .credit
      const notes = cloneOne(section, ".biblio") || cloneOne(section, ".credit");
      if (notes) notes.classList.add("mproj-credit-3x");

      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      bodies.forEach((b) => wrap.appendChild(b));
      if (notes) {
        addSpacer(wrap, "md");
        wrap.appendChild(notes);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: images.slice(0, 2), ratio: "1/1", slider: true }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet4: (section) => {
      // CAISSE DE RÉSONANCE:
      // Intro(t extrait titre) -> Body -> Protocole titre(t extrait titre) -> Protocole body
      // -> Crédit*3 -> YouTube embed (new) -> IMG x3 (3/2 slider)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const intro = cloneOne(section, ".intro");
      if (intro) intro.classList.add("extrait-titre");

      const body = cloneMany(section, ".context");

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");
      const protocBody = cloneOne(section, ".protocole-corps");

      const credit = markCredit3x(cloneOne(section, ".credit"));

      // YouTube : depuis le lien existant
      const ytLink = q(section, "a[href*='youtube.com'], a[href*='youtu.be']");
      const ytUrl = ytLink ? ytLink.getAttribute("href") : "";

      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      body.forEach((b) => wrap.appendChild(b));
      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }
      if (ytUrl) wrap.appendChild(buildYouTubeEmbed(ytUrl));

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: images.slice(0, 3), ratio: "3/2", slider: true }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet5: (section) => {
      // GESTES POSSIBLES:
      // Intro(t extrait titre) -> Body -> Protocole titre(t extrait titre) -> Protocole corps
      // -> Crédit*3 -> IMG IMG (2/3 slider)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const intro = cloneOne(section, ".intro");
      if (intro) intro.classList.add("extrait-titre");

      const body = cloneMany(section, ".context");

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");
      const protocBody = cloneOne(section, ".protocole-corps");

      const credit = markCredit3x(cloneOne(section, ".credit"));

      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      body.forEach((b) => wrap.appendChild(b));
      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: images.slice(0, 2), ratio: "2/3", slider: true }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet6: (section) => {
      // LES MARGES FORCÉES:
      // Intro(t extrait titre) -> Body -> Extrait titre -> Extrait body -> Crédit*3 -> Image (1/1)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const intro = cloneOne(section, ".intro");
      if (intro) intro.classList.add("extrait-titre");

      const body = cloneMany(section, ".context");
      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      body.forEach((b) => wrap.appendChild(b));
      if (extraitTitre) {
        // espace entre body -> extrait titre
        addSpacer(wrap, "lg");
        wrap.appendChild(extraitTitre);
      }
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet7: (section) => {
      // DÉJÀ DEMAIN:
      // Body -> Crédit*3 -> IMG 2/3
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const body = cloneMany(section, ".context");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      body.forEach((b) => wrap.appendChild(b));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }
      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "2/3", slider: false }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet8: (section) => {
      // LE PAYSAGE:
      // Protocole titre(t extrait titre) -> protocole corps -> extrait titre -> extrait corps -> crédit*3
      // -> 12 images 1/1 slider
      // (ignore crédits en plus des 4 vignettes)
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");
      const protocBody = cloneOne(section, ".protocole-corps");

      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");

      // Crédit principal : p8-credit-3 (c'est celui que tu veux)
      const credit = markCredit3x(cloneOne(section, ".credit-p8-3") || cloneOne(section, ".credit"));

      // Images : on prend toutes les placeholders, mais on ne prend pas les crédits supplémentaires.
      const images = clonePlaceholders(section);

      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (extraitTitre) {
        addSpacer(wrap, "lg");
        wrap.appendChild(extraitTitre);
      }
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: images, ratio: "1/1", slider: true }));
      }

      frag.appendChild(wrap);
      return frag;
    },

    projet9: (section) => {
      // NYAZE:
      // Protocole titre(t extrait titre) -> protocole body -> extrait titre -> extrait body -> crédit*3 -> IMG 1/1
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");
      const protocBody = cloneOne(section, ".protocole-corps");

      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");

      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (extraitTitre) {
        addSpacer(wrap, "lg");
        wrap.appendChild(extraitTitre);
      }
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) {
        addSpacer(wrap, "md");
        wrap.appendChild(credit);
      }

      if (images.length) {
        wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));
      }

      frag.appendChild(wrap);
      return frag;
    },
  };

  // --- Apply / Restore --------------------------------------

  const applyMobileToSection = (section) => {
    if (!section || section.classList.contains("mproj-has-mobile")) return;

    ensureStyle();
    snapshot(section);

    // On masque le layout desktop interne (pX / grid-...) en lui ajoutant une classe.
    // On ne le supprime pas: on remplace section.innerHTML par wrapper mobile.
    // Pour restore: on remet l'innerHTML original.

    const id = section.id;
    const rule = RULES[id];
    if (!rule) return;

    // Build mobile content
    const frag = rule(section);

    // Replace
    section.innerHTML = "";
    section.appendChild(frag);
    section.classList.add("mproj-has-mobile");

    // Lazy + async decode sur tous les IMG injectés
    qa(section, "img").forEach((img) => {
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    });
  };

  const maybeApply = () => {
    // Si pas open, on ne touche à rien.
    if (!document.body.classList.contains("has-open")) {
      // si on a laissé un mobile layout quelque part, restore tout
      original.forEach((_, sec) => restore(sec));
      return;
    }

    const open = getOpenProjectSection();
    if (!open) return;

    if (isMobile()) {
      applyMobileToSection(open);
    } else {
      // desktop => restore uniquement la section ouverte (et toute autre)
      original.forEach((_, sec) => restore(sec));
    }
  };

  // Observe class changes on body (has-open)
  const observeBody = () => {
    const mo = new MutationObserver(() => maybeApply());
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return mo;
  };

  // --- Init ---------------------------------------------------

  const init = () => {
    ensureStyle();
    observeBody();
    window.addEventListener("resize", debounce(maybeApply, 150), { passive: true });
    // run once
    maybeApply();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
