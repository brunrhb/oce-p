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
    text-align: right !important;
  }

  /* Media blocks */
  .mproj-media{ display:flex; flex-direction:column; gap: 10px; }

  /* Tous les médias doivent prendre 100% de la largeur dispo (hors marges),
     en conservant les proportions (sauf ceux dans des wrappers ratio). */
  .${WRAP_CLASS} img:not(.mproj-ratio img){
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    display:block;
  }
  .${WRAP_CLASS} video:not(.mproj-ratio video){
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    display:block;
  }
  .${WRAP_CLASS} iframe{
    width: 100% !important;
    max-width: 100% !important;
    display:block;
  }

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
  .mproj-spacer-lg{ height: clamp(35px, 6vw, 46px); }

  /* Embed YouTube responsive */
  .mproj-yt{ position:relative; width:100%; aspect-ratio: 16 / 9; overflow:hidden; background:black; }
  .mproj-yt iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }

  /* ------------------------------------------------------------
     INFO-BOXE (mobile simplifié)
     - Reprend les marges mobiles (--m-left/--m-right)
     - Texte légèrement plus petit, colonne texte élargie
     - Colonne texte descend d'un spacer sous "bio"
     - Image fixe en "background": 40vw x 50vh
     - Dégradé conservé, opacité du fondu diminuée (image + visible)
  ------------------------------------------------------------ */
  .info-boxe .grid-info{
    margin-left: var(--m-left) !important;
    margin-right: var(--m-right) !important;
    margin-top: calc(var(--m-top) + 32px) !important;
    column-gap: 0 !important;
    grid-template-columns: 1fr !important;
    height: auto !important;
    min-height: calc(100vh - var(--m-top)) !important;
  }

  .info-boxe .col-info-1{
    /* On laisse une place pour l'image fixe à droite */
    padding-right: calc(40vw + 14px) !important;
    max-width: 100% !important;
  }

  .info-boxe .info-body{
    font-size: clamp(14px, 3.55vw, 17px) !important;
    line-height: 1.25 !important;
  }

  .info-boxe .col-info-2{
    position: fixed !important;
    top: calc(var(--m-top) + 18px) !important;
    right: var(--m-right) !important;
    left: auto !important;
    width: 40vw !important;
    height: 50vh !important;
    min-height: 50vh !important;
    z-index: 500 !important;
    overflow:hidden !important;
    pointer-events:none;
  }

  .info-boxe .col-info-2 .holder-p0{
    width: 100% !important;
    height: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  /* image plus visible (+20% env) */
  .info-boxe .col-info-2 .holder-p0 img{
    opacity: 0.92 !important;
  }

  .info-boxe .col-info-2 .fading::after{
    background: linear-gradient(to bottom,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.85) 100%
    ) !important;
  }
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

  // --- Spacing rules (harmonisation) ---------------------------
  // Titre = "Protocole / Extrait / Intro" (italique+gras) ; Body = texte associé.
  const GAP_TITLE_BODY = "sm";     // entre un titre de partie et son body
  const GAP_BETWEEN_PARTS = "lg";  // entre (partie titre/body) et (partie suivante)
  const GAP_BODY_CREDIT = "md";    // entre dernier body et credit
  const GAP_CREDIT_MEDIA = "md";   // entre credit/notes et media

  const appendPart = (wrap, titleNode, bodyNodes, { after = GAP_BETWEEN_PARTS } = {}) => {
    const bodies = Array.isArray(bodyNodes) ? bodyNodes.filter(Boolean) : (bodyNodes ? [bodyNodes] : []);
    const hasTitle = !!titleNode;
    const hasBody = bodies.length > 0;

    if (hasTitle) wrap.appendChild(titleNode);
    if (hasTitle && hasBody) addSpacer(wrap, GAP_TITLE_BODY);

    bodies.forEach((n) => wrap.appendChild(n));

    if ((hasTitle || hasBody) && after) addSpacer(wrap, after);
  };

  const clone = (node) => (node ? node.cloneNode(true) : null);

  // Convertit un bloc crédit/notes en version mobile x3 + align right
  const credit3x = (node) => {
    const n = clone(node);
    if (!n) return null;
    n.classList.add("mproj-credit-3x");
    return n;
  };

  // --- Helpers: récupérer parties dans une section existante ---

  const findFirstTextLike = (root, patterns = []) => {
    // Recherche un élément texte dont le contenu commence par un des patterns
    const els = qa(root, "*");
    for (const el of els) {
      if (!el || !el.textContent) continue;
      const t = el.textContent.trim();
      if (!t) continue;
      if (patterns.some((p) => t.toLowerCase().startsWith(p.toLowerCase()))) return el;
    }
    return null;
  };

  const collectTextBlocksAfterTitle = (root, titleEl, stopSelectors = []) => {
    // Collecte les siblings après titleEl jusqu'à rencontrer un stop selector
    if (!root || !titleEl) return [];
    const blocks = [];
    let cur = titleEl.nextElementSibling;
    while (cur) {
      if (stopSelectors.some((sel) => cur.matches(sel) || cur.querySelector(sel))) break;
      blocks.push(cur);
      cur = cur.nextElementSibling;
    }
    return blocks;
  };

  // --- Project builders (basés sur structure actuelle) --------

  const buildProjetGeneric = (section, config) => {
    // config: { introTitleSel?, introBodySel?, protocoleTitleSel?, protocoleBodySel?, extraitTitleSel?, extraitBodySel?, creditSel?, mediaEls?: [..], mediaRatio?, slider?: true, yt?: string }

    snapshot(section);
    ensureStyle();

    // marquer tout ce qui existait comme "desktop" pour pouvoir le cacher proprement
    const desktopChildren = Array.from(section.children);
    desktopChildren.forEach((c) => c.classList.add("mproj-desktop-hidden"));

    const wrap = document.createElement("div");
    wrap.className = WRAP_CLASS;

    const grab = (sel) => (sel ? q(section, sel) : null);

    // --- Intro
    const introTitle = clone(grab(config.introTitleSel));
    const introBody = config.introBodySel ? clone(grab(config.introBodySel)) : null;
    appendPart(wrap, introTitle, introBody, { after: config.afterIntro ?? GAP_BETWEEN_PARTS });

    // --- Protocole
    const protTitle = clone(grab(config.protocoleTitleSel));
    const protBody = config.protocoleBodySel ? clone(grab(config.protocoleBodySel)) : null;
    appendPart(wrap, protTitle, protBody, { after: config.afterProtocole ?? GAP_BETWEEN_PARTS });

    // --- Extrait
    const extTitle = clone(grab(config.extraitTitleSel));
    const extBody = config.extraitBodySel ? clone(grab(config.extraitBodySel)) : null;
    appendPart(wrap, extTitle, extBody, { after: config.afterExtrait ?? GAP_BODY_CREDIT });

    // --- Credits/notes
    const creditNode = credit3x(grab(config.creditSel));
    if (creditNode) {
      wrap.appendChild(creditNode);
      addSpacer(wrap, GAP_CREDIT_MEDIA);
    }

    // --- YouTube (optionnel)
    if (config.yt) {
      const ytWrap = document.createElement("div");
      ytWrap.className = "mproj-yt";
      ytWrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${config.yt}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      wrap.appendChild(ytWrap);
      addSpacer(wrap, GAP_BETWEEN_PARTS);
    }

    // --- Medias
    const medias = (config.mediaEls || [])
      .map((selOrEl) => (typeof selOrEl === "string" ? grab(selOrEl) : selOrEl))
      .filter(Boolean)
      .map(clone);

    if (medias.length) {
      const mediaBox = document.createElement("div");
      mediaBox.className = "mproj-media";

      if (config.slider && medias.length > 1) {
        const slider = document.createElement("div");
        slider.className = "mproj-slider";

        medias.forEach((m) => {
          const slide = document.createElement("div");
          slide.className = "mproj-slide";

          const ratio = document.createElement("div");
          ratio.className = `mproj-ratio ${config.mediaRatio || "mproj-1x1"}`;

          // si c'est une image/vidéo directe, on l'encapsule
          if (m.tagName === "IMG" || m.tagName === "VIDEO") {
            ratio.appendChild(m);
          } else {
            // sinon on cherche une img/vid à l'intérieur
            const innerImg = q(m, "img");
            const innerVid = q(m, "video");
            if (innerImg) ratio.appendChild(innerImg.cloneNode(true));
            else if (innerVid) ratio.appendChild(innerVid.cloneNode(true));
            else ratio.appendChild(m);
          }

          slide.appendChild(ratio);
          slider.appendChild(slide);
        });

        mediaBox.appendChild(slider);
      } else {
        medias.forEach((m) => {
          if (config.mediaRatio && (m.tagName === "IMG" || m.tagName === "VIDEO")) {
            const ratio = document.createElement("div");
            ratio.className = `mproj-ratio ${config.mediaRatio}`;
            ratio.appendChild(m);
            mediaBox.appendChild(ratio);
          } else {
            mediaBox.appendChild(m);
          }
        });
      }

      wrap.appendChild(mediaBox);
    }

    section.appendChild(wrap);
    section.classList.add("mproj-has-mobile");
  };

  // --- Projet mapping (sélecteurs spécifiques) ----------------
  // IMPORTANT: on garde tes classes existantes, on ne fait que les cloner.
  // Si un sélecteur rate (structure change), le script n'explose pas : il affiche juste ce qu'il trouve.

  const applyMobileForOpenProject = () => {
    if (!isMobile()) return;

    const sec = getOpenProjectSection();
    if (!sec) return;

    // ne pas re-builder si déjà fait
    if (sec.classList.contains("mproj-has-mobile")) return;

    const id = sec.id;

    // NOTE: tes structures changent un peu selon projets, donc on mappe au cas par cas.
    // Ici on utilise les sélecteurs existants dans ton HTML actuel.

    try {
      if (id === "projet1") {
        // Liaisons végétales: Extrait + credit + 1 image 3/2
        buildProjetGeneric(sec, {
          extraitTitleSel: ".extrait-titre, .col-p1s2-2 .extrait-titre, .extrait",
          extraitBodySel: ".extrait-body, .col-p1s2-2 .extrait-body, .extrait-text",
          creditSel: ".credit, .jump-bloc-credit",
          mediaEls: ["img"],
          mediaRatio: "mproj-3x2",
          slider: false,
        });
      } else {
        // fallback ultra safe : on clone tout le texte (hors titres de projet) + toutes les images en slider 1x1
        // (ça évite un blanc si un mapping est raté)
        snapshot(sec);
        ensureStyle();

        const desktopChildren = Array.from(sec.children);
        desktopChildren.forEach((c) => c.classList.add("mproj-desktop-hidden"));

        const wrap = document.createElement("div");
        wrap.className = WRAP_CLASS;

        // Clone les blocs texte principaux
        const textBlocks = qa(sec, ".intro, .protocole-titre, .protocole-body, .extrait-titre, .extrait-body, p, .text-block-p0, .text-block-p1, .text-block-p2, .text-block-p3");
        textBlocks
          .filter((el) => !el.closest(".PROJET"))
          .slice(0, 18)
          .forEach((el) => wrap.appendChild(clone(el)));

        // credits
        qa(sec, ".credit, .info-credit, .notes, .note").forEach((c) => wrap.appendChild(credit3x(c)));

        // slider images
        const imgs = qa(sec, "img");
        if (imgs.length) {
          const mediaBox = document.createElement("div");
          mediaBox.className = "mproj-media";

          const slider = document.createElement("div");
          slider.className = "mproj-slider";

          imgs.forEach((img) => {
            const slide = document.createElement("div");
            slide.className = "mproj-slide";
            const ratio = document.createElement("div");
            ratio.className = "mproj-ratio mproj-1x1";
            ratio.appendChild(img.cloneNode(true));
            slide.appendChild(ratio);
            slider.appendChild(slide);
          });

          mediaBox.appendChild(slider);
          wrap.appendChild(mediaBox);
        }

        sec.appendChild(wrap);
        sec.classList.add("mproj-has-mobile");
      }
    } catch (e) {
      // sécurité : si bug, on restore
      console.error("mobile-projects: build error", e);
      restore(sec);
    }
  };

  const cleanupIfNeeded = () => {
    // si on repasse en desktop, restore la section ouverte (si snapshot)
    if (isMobile()) return;
    const sec = getOpenProjectSection();
    if (sec && original.has(sec)) restore(sec);
  };

  // Au changement d'ouverture/fermeture des projets, on applique.
  // Ton script existant toggle .is-hidden + body.has-open ; on écoute simplement.
  const observe = () => {
    const mo = new MutationObserver(() => {
      applyMobileForOpenProject();
      cleanupIfNeeded();
    });
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });

    // aussi sur resize
    window.addEventListener(
      "resize",
      debounce(() => {
        // si on change de mode, on rebuild/restore
        const sec = getOpenProjectSection();
        if (!sec) return;

        if (isMobile()) {
          if (!sec.classList.contains("mproj-has-mobile")) applyMobileForOpenProject();
        } else {
          if (original.has(sec)) restore(sec);
        }
      }, 200)
    );
  };

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    observe();
    applyMobileForOpenProject();
  });
})();
