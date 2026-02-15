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
  /* Marges mobile sur mesure : un peu plus à gauche (zone "bio") */
  :root{
    --m-left: clamp(26px, 9vw, 44px);
    --m-right: clamp(14px, 5vw, 26px);
  }

  .${WRAP_CLASS}{
    display:flex;
    flex-direction:column;
    gap: 0;
    box-sizing: border-box;
    padding-left: var(--m-left);
    padding-right: var(--m-right);
  }

  /* gommer les marges/paddings parasites des blocs (inline) */
  .${WRAP_CLASS} > *{
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* exception: slider peut garder son gap/padding-bottom */
  .${WRAP_CLASS} .mproj-slider{
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* Tous les titres de parties (protocole/extrait/intro) alignés à gauche en mobile */
  .${WRAP_CLASS} .intro,
  .${WRAP_CLASS} .protocole-titre,
  .${WRAP_CLASS} .extrait-titre{
    text-align: left !important;
  }

  /* FIX: les intros (souvent en italic+bold) sont trop petites car le desktop utilise
     font-size: calc(1vw + 0.5vh). Sur mobile, on les aligne sur la taille "extrait-titre". */
  .${WRAP_CLASS} .intro{
    font-size: clamp(20px, calc(1.618 * 1vw + 8px), 35px) !important;
    line-height: 1.12;
  }

  /* On masque le layout desktop original uniquement quand la version mobile est active */
  .mproj-desktop-hidden{ display:none !important; }

  /* Notes / crédits : override propre (on se détache du clamp desktop)
     Objectif : lisible, présent, mais pas énorme. */
  .mproj-credit-3x{
    font-size: clamp(14px, 4.2vw, 20px) !important;
    line-height: 1.18;
  }

  /* Credits + notes align right (mobile only, sans casser le layout) */
  .${WRAP_CLASS} .credit,
  .${WRAP_CLASS} .biblio{
    width: 100% !important;
    text-align: right !important;
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

  const addSpacerIfHasChildren = (parent, size = "md") => {
    if (parent && parent.childNodes && parent.childNodes.length) addSpacer(parent, size);
  };

  // --- Spacing rules (harmonisation) ---------------------------
  // On ne change pas les styles existants des blocs ; on insère juste
  // des "spacers" entre les couples titre→body, entre parties, etc.
  const GAP_TITLE_BODY = "sm";    // entre un titre de partie et son body
  const GAP_BETWEEN_PARTS = "lg"; // entre (partie titre/body) et (partie suivante)
  const GAP_BODY_CREDIT = "md";   // entre dernier body et credit
  const GAP_CREDIT_MEDIA = "md";  // entre credit/notes et media

  const normalizeSpacing = (wrap) => {
    if (!wrap) return;

    // 1) enlever tous les spacers existants (on repart propre pour harmoniser)
    [...wrap.children].forEach((el) => {
      if (el.classList && el.classList.contains("mproj-spacer")) el.remove();
    });

    const children = [...wrap.children];

    const isTitle = (el) =>
      el.classList &&
      (el.classList.contains("intro") ||
        el.classList.contains("protocole-titre") ||
        el.classList.contains("extrait-titre"));

    const isCreditOrNotes = (el) =>
      el.classList &&
      (el.classList.contains("credit") || el.classList.contains("biblio") || el.classList.contains("notes"));

    const isMedia = (el) =>
      el.classList && (el.classList.contains("mproj-media") || el.classList.contains("mproj-yt"));

    const rebuilt = document.createDocumentFragment();

    for (let i = 0; i < children.length; i++) {
      const cur = children[i];
      const next = children[i + 1];

      rebuilt.appendChild(cur);

      if (!next) continue;

      // Titre -> Body (ou tout ce qui suit)
      if (isTitle(cur) && !isTitle(next) && !isCreditOrNotes(next) && !isMedia(next)) {
        addSpacer(rebuilt, GAP_TITLE_BODY);
        continue;
      }

      // Body -> Crédit/Notes
      if (!isTitle(cur) && !isCreditOrNotes(cur) && !isMedia(cur) && isCreditOrNotes(next)) {
        addSpacer(rebuilt, GAP_BODY_CREDIT);
        continue;
      }

      // Crédit/Notes -> Media
      if (isCreditOrNotes(cur) && isMedia(next)) {
        addSpacer(rebuilt, GAP_CREDIT_MEDIA);
        continue;
      }

      // Entre parties: un body (ou autre) -> prochain titre
      if (!isTitle(cur) && !isMedia(cur) && isTitle(next)) {
        addSpacer(rebuilt, GAP_BETWEEN_PARTS);
        continue;
      }
    }

    wrap.replaceChildren(rebuilt);
  };

  const wrapRatio = (node, ratioClass) => {
    const w = document.createElement("div");
    w.className = `mproj-ratio ${ratioClass}`;
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

    const src = id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    yt.appendChild(iframe);
    return yt;
  };

  // --- Project-specific extractors ----------------------------

  const cloneOne = (section, selector) => {
    const el = q(section, selector);
    return el ? el.cloneNode(true) : null;
  };
  const cloneMany = (section, selector) => qa(section, selector).map((el) => el.cloneNode(true));
  const clonePlaceholders = (section) => cloneMany(section, "[class*='placeholder']");

  const markCredit3x = (node) => {
    if (!node) return node;
    node.classList.add("mproj-credit-3x");
    return node;
  };

  // --- Rules mapping (exactement selon tes specs) --------------

  const RULES = {
    projet1: (section) => {
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: images, ratio: "3/2", slider: false }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet2: (section) => {
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");

      const protocCorps = cloneOne(section, ".protocole-corps");
      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocCorps) wrap.appendChild(protocCorps);
      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet3: (section) => {
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const intro = cloneOne(section, ".intro");
      if (intro) intro.classList.add("extrait-titre");

      const bodies = cloneMany(section, ".context");
      const notes = cloneOne(section, ".biblio") || cloneOne(section, ".credit");
      if (notes) notes.classList.add("mproj-credit-3x");

      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      bodies.forEach((b) => wrap.appendChild(b));
      if (notes) wrap.appendChild(notes);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: images.slice(0, 2), ratio: "1/1", slider: true }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet4: (section) => {
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

      const ytLink = q(section, "a[href*='youtube.com'], a[href*='youtu.be']");
      const ytUrl = ytLink ? ytLink.getAttribute("href") : "";

      const images = clonePlaceholders(section);

      if (intro) wrap.appendChild(intro);
      body.forEach((b) => wrap.appendChild(b));
      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (credit) wrap.appendChild(credit);
      if (ytUrl) wrap.appendChild(buildYouTubeEmbed(ytUrl));
      if (images.length) wrap.appendChild(buildMediaBlock({ items: images.slice(0, 3), ratio: "3/2", slider: true }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet5: (section) => {
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
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: images.slice(0, 2), ratio: "2/3", slider: true }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet6: (section) => {
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
      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet7: (section) => {
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const body = cloneMany(section, ".context");
      const credit = markCredit3x(cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      body.forEach((b) => wrap.appendChild(b));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "2/3", slider: false }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet8: (section) => {
      const frag = document.createDocumentFragment();
      const wrap = document.createElement("div");
      wrap.className = WRAP_CLASS;

      const protocTitre = cloneOne(section, ".protocole-titre");
      if (protocTitre) protocTitre.classList.add("extrait-titre");
      const protocBody = cloneOne(section, ".protocole-corps");

      const extraitTitre = cloneOne(section, ".extrait-titre");
      const extraits = cloneMany(section, ".extrait");

      const credit = markCredit3x(cloneOne(section, ".credit-p8-3") || cloneOne(section, ".credit"));
      const images = clonePlaceholders(section);

      if (protocTitre) wrap.appendChild(protocTitre);
      if (protocBody) wrap.appendChild(protocBody);
      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: images, ratio: "1/1", slider: true }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },

    projet9: (section) => {
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
      if (extraitTitre) wrap.appendChild(extraitTitre);
      extraits.forEach((e) => wrap.appendChild(e));
      if (credit) wrap.appendChild(credit);
      if (images.length) wrap.appendChild(buildMediaBlock({ items: [images[0]], ratio: "1/1", slider: false }));

      normalizeSpacing(wrap);
      frag.appendChild(wrap);
      return frag;
    },
  };

  // --- Apply / Restore --------------------------------------

  const applyMobileToSection = (section) => {
    if (!section || section.classList.contains("mproj-has-mobile")) return;

    ensureStyle();
    snapshot(section);

    const id = section.id;
    const rule = RULES[id];
    if (!rule) return;

    const frag = rule(section);

    section.innerHTML = "";
    section.appendChild(frag);
    section.classList.add("mproj-has-mobile");

    qa(section, "img").forEach((img) => {
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    });
  };

  const maybeApply = () => {
    if (!document.body.classList.contains("has-open")) {
      original.forEach((_, sec) => restore(sec));
      return;
    }

    const open = getOpenProjectSection();
    if (!open) return;

    if (isMobile()) {
      applyMobileToSection(open);
    } else {
      original.forEach((_, sec) => restore(sec));
    }
  };

  const observeBody = () => {
    const mo = new MutationObserver(() => maybeApply());
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return mo;
  };

  // --- Init ---------------------------------------------------

  const init = () => {
    ensureStyle();

    const syncInfoLabel = () => {
      const el = document.querySelector('.info-titre');
      if (!el) return;
      el.textContent = isMobile() ? 'bio' : 'infos';
    };
    syncInfoLabel();

    observeBody();
    window.addEventListener(
      "resize",
      debounce(() => {
        const el = document.querySelector('.info-titre');
        if (el) el.textContent = isMobile() ? 'bio' : 'infos';
        maybeApply();
      }, 150),
      { passive: true }
    );

    maybeApply();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
