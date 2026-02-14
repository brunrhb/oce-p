/**
 * Mobile Projects Adapter (<=800px)
 * - Does NOT touch project titles.
 * - Keeps existing content nodes (cloned), only reorders + media presentation.
 * - Injects minimal CSS + (optional) scroll-snap slider.
 *
 * Usage: include after your existing scripts:
 *   <script src="mobile-projects.js" defer></script>
 */
(() => {
  const BREAKPOINT = 800;
  const STYLE_ID = "mobile-projects-inline-style";
  const MOBILE_CLASS = "m-mobile-projects-active";

  /** @type {Map<HTMLElement, {hiddenNodes: HTMLElement[], originalDisplays: Map<HTMLElement,string>, injected: HTMLElement}>} */
  const applied = new Map();

  const isMobile = () => window.innerWidth < BREAKPOINT;

  const qs = (root, sel) => root ? root.querySelector(sel) : null;
  const qsa = (root, sel) => root ? Array.from(root.querySelectorAll(sel)) : [];

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* injected mobile layout (only active when ${MOBILE_CLASS} is on body) */
      body.${MOBILE_CLASS} section[id^="projet"] .m-mobile-wrap{ width: 100%; }

      /*
        Mobile layout:
        - rail à gauche pour l'étiquette ("infos" -> "bio")
        - marges latérales sur-mesure (sans gonfler partout)
      */
      body.${MOBILE_CLASS} .m-mobile-wrap{
        position: relative;
        display: block;
        max-width: 540px;
        margin: 0 auto;
        padding-left: calc(var(--m-left) + var(--m-rail-w) + var(--m-rail-gap));
        padding-right: var(--m-right);
      }

      body.${MOBILE_CLASS} .m-mobile-text > *{
        /* keep existing margins/typo; no reset */
      }

      /* Crédit / notes : plus grand, mais pas x3 (trop violent avec les clamp). */
      body.${MOBILE_CLASS} .m-credit-3x{
        font-size: clamp(16px, 4.2vw, 22px) !important;
        line-height: 1.15;
      }
      body.${MOBILE_CLASS} .m-notes{
        font-size: clamp(14px, 3.6vw, 18px) !important;
        line-height: 1.25;
      }

      body.${MOBILE_CLASS} .m-rail-label{
        position: absolute;
        left: var(--m-left);
        top: var(--m-rail-top);
        width: var(--m-rail-w);
        line-height: 1;
      }
      body.${MOBILE_CLASS} .m-rail-label span{
        display:block;
        font-size: clamp(18px, 4.2vw, 22px);
        line-height: 1;
      }

      body.${MOBILE_CLASS} .m-spacer{ height: var(--m-spacer); }

      /* Titres de sections (intro / protocole / extrait) : toujours alignés à gauche */
      body.${MOBILE_CLASS} .m-part-title{ text-align:left !important; }

      /* media */
      body.${MOBILE_CLASS} .m-media{ width: 100%; }

      /* slider (scroll-snap) */
      body.${MOBILE_CLASS} .m-slider{
        display: flex;
        gap: 12px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 6px;
      }
      body.${MOBILE_CLASS} .m-slide{
        flex: 0 0 86%;
        scroll-snap-align: start;
      }
      body.${MOBILE_CLASS} .m-slide-inner{
        width: 100%;
        overflow: hidden;
      }
      body.${MOBILE_CLASS} .m-slide-inner[data-ratio="1/1"]{ aspect-ratio: 1 / 1; }
      body.${MOBILE_CLASS} .m-slide-inner[data-ratio="2/3"]{ aspect-ratio: 2 / 3; }
      body.${MOBILE_CLASS} .m-slide-inner[data-ratio="3/2"]{ aspect-ratio: 3 / 2; }

      body.${MOBILE_CLASS} .m-slide-inner img,
      body.${MOBILE_CLASS} .m-stack img{
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      body.${MOBILE_CLASS} .m-stack{
        display: grid;
        gap: 12px;
      }
      body.${MOBILE_CLASS} .m-stack-item{
        overflow: hidden;
      }
      body.${MOBILE_CLASS} .m-stack-item[data-ratio="1/1"]{ aspect-ratio: 1 / 1; }
      body.${MOBILE_CLASS} .m-stack-item[data-ratio="2/3"]{ aspect-ratio: 2 / 3; }
      body.${MOBILE_CLASS} .m-stack-item[data-ratio="3/2"]{ aspect-ratio: 3 / 2; }

      /* YouTube embed wrapper */
      body.${MOBILE_CLASS} .m-yt{
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
      }
      body.${MOBILE_CLASS} .m-yt iframe{
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }

      :root{
        --m-left: 16px;
        --m-right: 16px;
        --m-rail-w: 56px;
        --m-rail-gap: 12px;
        --m-rail-top: 88px;
        --m-spacer: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  function makeSpacer(mult = 1) {
    const s = document.createElement("div");
    s.className = "m-spacer";
    if (mult !== 1) s.style.height = `calc(var(--m-spacer) * ${mult})`;
    return s;
  }

  function markPartTitle(el) {
    if (!el) return el;
    el.classList.add("m-part-title");
    el.style.textAlign = "left";
    return el;
  }

  function getOpenProjectSection() {
    // your script toggles .is-hidden on target sections
    const open = document.querySelector('section[id^="projet"]:not(.is-hidden)');
    return open || null;
  }

  function markImagesLazy(root) {
    qsa(root, "img").forEach((img) => {
      // don't override if already set
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    });
  }

  function computedFontSizePx(el) {
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    const fs = cs && cs.fontSize ? cs.fontSize : null;
    return fs;
  }

  function cloneNodeKeep(el) {
    if (!el) return null;
    const c = el.cloneNode(true);
    markImagesLazy(c);
    return c;
  }

  function buildMedia(images, { ratio, slider }) {
    const media = document.createElement("div");
    media.className = "m-media";

    if (!images.length) return media;

    if (slider) {
      const track = document.createElement("div");
      track.className = "m-slider";
      images.forEach((img) => {
        const slide = document.createElement("div");
        slide.className = "m-slide";
        const inner = document.createElement("div");
        inner.className = "m-slide-inner";
        inner.dataset.ratio = ratio;
        inner.appendChild(img);
        slide.appendChild(inner);
        track.appendChild(slide);
      });
      media.appendChild(track);
    } else {
      const stack = document.createElement("div");
      stack.className = "m-stack";
      images.forEach((img) => {
        const item = document.createElement("div");
        item.className = "m-stack-item";
        item.dataset.ratio = ratio;
        item.appendChild(img);
        stack.appendChild(item);
      });
      media.appendChild(stack);
    }

    return media;
  }

  function youtubeEmbedFromHref(href) {
    if (!href) return null;
    try {
      const url = new URL(href, window.location.origin);
      // youtube watch?v=...
      let id = "";
      if (url.hostname.includes("youtube.com")) {
        id = url.searchParams.get("v") || "";
      } else if (url.hostname === "youtu.be") {
        id = url.pathname.replace("/", "");
      }
      if (!id) return null;

      const wrap = document.createElement("div");
      wrap.className = "m-yt";

      const iframe = document.createElement("iframe");
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;

      wrap.appendChild(iframe);
      return wrap;
    } catch {
      return null;
    }
  }

  /**
   * Build the mobile view for a project section.
   * Returns { injected, hiddenNodes, originalDisplays }
   */
  function buildMobileFor(section) {
    const id = section.id;

    // We hide the existing project wrapper (.p1, .p2, etc.)
    const projectRoot = qs(section, `.${id.replace("projet", "p")}`) || qs(section, "[class^='p']") || section.firstElementChild;

    const wrap = document.createElement("div");
    wrap.className = "m-mobile-wrap";

    // rail label (ancien "infos" -> "bio")
    const rail = document.createElement("div");
    rail.className = "m-rail-label";
    const railSpan = document.createElement("span");
    railSpan.textContent = "bio";
    rail.appendChild(railSpan);
    wrap.appendChild(rail);

    const text = document.createElement("div");
    text.className = "m-mobile-text";

    const nodesToAppend = [];
    let mediaSpec = null;
    let extraYtHref = null;

    // Helpers to pick nodes by meaning within this section
    const pickOne = (sel) => qs(section, sel);
    const pickAll = (sel) => qsa(section, sel);

    const push = (...els) => {
      els.flat().filter(Boolean).forEach((e) => nodesToAppend.push(e));
    };

    const asTitle = (el) => markPartTitle(el);

    // Per-project mapping (based on your validated Phase 1 rules)
    switch (id) {
      case "projet1": { // Liaisons végétales
        push(asTitle(cloneNodeKeep(pickOne(".extrait-titre"))));
        pickAll(".extrait").forEach((n) => push(cloneNodeKeep(n)));
        const credit = cloneNodeKeep(pickOne(".credit"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);
        mediaSpec = { ratio: "3/2", slider: false, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet2": { // Panser
        const extraitTitle = pickOne(".extrait-titre");
        const fsExtrait = computedFontSizePx(extraitTitle);

        const protocoleTitle = cloneNodeKeep(pickOne(".protocole-titre"));
        if (protocoleTitle && fsExtrait) protocoleTitle.style.fontSize = fsExtrait;

        push(asTitle(protocoleTitle));
        push(cloneNodeKeep(pickOne(".protocole-corps")));
        push(makeSpacer(1));
        push(asTitle(cloneNodeKeep(extraitTitle)));
        push(cloneNodeKeep(pickOne(".extrait")));
        const credit = cloneNodeKeep(pickOne(".credit"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        mediaSpec = { ratio: "1/1", slider: false, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet3": { // Aux mornes
        const fsTitle = computedFontSizePx(pickOne(".extrait-titre"));

        const intro = cloneNodeKeep(pickOne(".intro"));
        if (intro && fsTitle) intro.style.fontSize = fsTitle;
        push(asTitle(intro), makeSpacer(0.75));

        // Body = all context blocks
        pickAll(".context.autre-corps").forEach((n) => push(cloneNodeKeep(n)));

        // Notes = credits/biblio (plus discret que le crédit)
        const notes = document.createElement("div");
        const c1 = cloneNodeKeep(pickOne(".biblio"));
        const c2 = cloneNodeKeep(pickOne(".credit.credit-p3"));
        if (c1) notes.appendChild(c1);
        if (c2) notes.appendChild(c2);
        if (notes.childNodes.length) {
          notes.classList.add("m-notes");
          push(makeSpacer(0.75), notes);
        }

        mediaSpec = { ratio: "1/1", slider: true, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet4": { // Caisse de résonance
        const fsTitle = computedFontSizePx(pickOne(".extrait-titre"));

        const intro = cloneNodeKeep(pickOne(".intro"));
        if (intro && fsTitle) intro.style.fontSize = fsTitle;
        push(asTitle(intro), makeSpacer(0.75));

        // Body (keep contexts only; omit links here, we'll add embed later)
        pickAll(".context.context-p4").forEach((n) => push(cloneNodeKeep(n)));

        const protocoleTitle = cloneNodeKeep(pickOne(".protocole-titre"));
        if (protocoleTitle && fsTitle) protocoleTitle.style.fontSize = fsTitle;
        push(makeSpacer(1), asTitle(protocoleTitle));
        push(cloneNodeKeep(pickOne(".protocole-corps")));

        const credit = cloneNodeKeep(pickOne(".credit.credit-p4"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        // YouTube embed (mobile only) from existing link
        const a = pickOne('a[href*="youtube.com"], a[href*="youtu.be"]');
        extraYtHref = a ? a.getAttribute("href") : null;

        mediaSpec = { ratio: "3/2", slider: true, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet5": { // Gestes possibles
        const fsTitle = computedFontSizePx(pickOne(".extrait-titre"));

        const intro = cloneNodeKeep(pickOne(".intro"));
        if (intro && fsTitle) intro.style.fontSize = fsTitle;
        push(asTitle(intro), makeSpacer(0.75));

        push(cloneNodeKeep(pickOne(".context.context-p5")));

        const protocoleTitle = cloneNodeKeep(pickOne(".protocole-titre"));
        if (protocoleTitle && fsTitle) protocoleTitle.style.fontSize = fsTitle;
        push(makeSpacer(1), asTitle(protocoleTitle));
        push(cloneNodeKeep(pickOne(".protocole-corps")));

        const credit = cloneNodeKeep(pickOne(".credit[data-content='p5-credit'], .credit.jump-bloc-credit"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        mediaSpec = { ratio: "2/3", slider: true, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet6": { // Les marges forcées
        const extraitTitleEl = pickOne(".extrait-titre");
        const fsExtrait = computedFontSizePx(extraitTitleEl);

        const intro = cloneNodeKeep(pickOne(".intro"));
        if (intro && fsExtrait) intro.style.fontSize = fsExtrait;
        push(asTitle(intro), makeSpacer(0.75));

        // Body: main context
        push(cloneNodeKeep(pickOne(".context.context-p6")));

        push(makeSpacer(1));
        push(asTitle(cloneNodeKeep(extraitTitleEl)));
        push(cloneNodeKeep(pickOne(".extrait")));

        const credit = cloneNodeKeep(pickOne(".credit.credit-p6"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        mediaSpec = { ratio: "1/1", slider: false, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet7": { // Déjà demain
        push(cloneNodeKeep(pickOne(".context")));
        const credit = cloneNodeKeep(pickOne(".credit"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        mediaSpec = { ratio: "2/3", slider: false, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      case "projet8": { // Nous sommes le paysage
        const extraitTitleEl = pickOne(".extrait-titre");
        const fsExtrait = computedFontSizePx(extraitTitleEl);

        const protocoleTitle = cloneNodeKeep(pickOne(".protocole-titre"));
        if (protocoleTitle && fsExtrait) protocoleTitle.style.fontSize = fsExtrait;
        push(asTitle(protocoleTitle));
        push(cloneNodeKeep(pickOne(".protocole-corps")));

        push(makeSpacer(1));
        push(asTitle(cloneNodeKeep(extraitTitleEl)));
        pickAll(".extrait").forEach((n) => push(cloneNodeKeep(n)));

        const credit = cloneNodeKeep(pickOne(".credit.credit-p8-3"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        // Ignore extra credits in the images area (p8-credit-1 / p8-credit-2)
        mediaSpec = { ratio: "1/1", slider: true, includeAllImages: true, ignoreCredits: [".credit.credit-p8-1", ".credit.credit-p8-2"] };
        break;
      }
      case "projet9": { // Nyaze
        const extraitTitleEl = pickOne(".extrait-titre");
        const fsExtrait = computedFontSizePx(extraitTitleEl);

        const protocoleTitle = cloneNodeKeep(pickOne(".protocole-titre"));
        if (protocoleTitle && fsExtrait) protocoleTitle.style.fontSize = fsExtrait;
        push(asTitle(protocoleTitle));
        push(cloneNodeKeep(pickOne(".protocole-corps")));

        push(makeSpacer(1));
        push(asTitle(cloneNodeKeep(extraitTitleEl)));
        push(cloneNodeKeep(pickOne(".extrait")));

        const credit = cloneNodeKeep(pickOne(".credit.credit-p9"));
        if (credit) credit.classList.add("m-credit-3x");
        push(makeSpacer(0.75), credit);

        mediaSpec = { ratio: "1/1", slider: false, includeAllImages: true, ignoreCredits: [] };
        break;
      }
      default:
        break;
    }

    // Append text nodes (skip nulls)
    nodesToAppend.filter(Boolean).forEach((n) => text.appendChild(n));

    // Mobile-only YouTube embed for projet4
    if (id === "projet4" && extraYtHref) {
      const embed = youtubeEmbedFromHref(extraYtHref);
      if (embed) text.appendChild(embed);
    }

    // Media (images)
    if (mediaSpec) {
      const imgs = qsa(section, "img").map((img) => {
        const c = img.cloneNode(true);
        if (!c.hasAttribute("loading")) c.setAttribute("loading", "lazy");
        if (!c.hasAttribute("decoding")) c.setAttribute("decoding", "async");
        return c;
      });

      const media = buildMedia(imgs, { ratio: mediaSpec.ratio, slider: mediaSpec.slider });

      // Espace entre dernier bloc texte (souvent crédit/notes) et le média
      text.appendChild(makeSpacer(0.75));

      wrap.appendChild(text);
      wrap.appendChild(media);
    } else {
      wrap.appendChild(text);
    }

    // Hide projectRoot and insert wrap
    const hiddenNodes = [];
    const originalDisplays = new Map();

    if (projectRoot instanceof HTMLElement) {
      hiddenNodes.push(projectRoot);
      originalDisplays.set(projectRoot, projectRoot.style.display || "");
      projectRoot.style.display = "none";
    }

    section.appendChild(wrap);

    return { injected: wrap, hiddenNodes, originalDisplays };
  }

  function applyMobile(section) {
    if (!section || applied.has(section)) return;
    ensureStyle();
    document.body.classList.add(MOBILE_CLASS);

    const built = buildMobileFor(section);
    applied.set(section, built);
  }

  function restoreSection(section) {
    const state = applied.get(section);
    if (!state) return;

    // remove injected
    if (state.injected && state.injected.parentNode) {
      state.injected.parentNode.removeChild(state.injected);
    }

    // restore displays
    for (const el of state.hiddenNodes) {
      const prev = state.originalDisplays.get(el);
      el.style.display = prev || "";
    }

    applied.delete(section);

    if (applied.size === 0) {
      document.body.classList.remove(MOBILE_CLASS);
    }
  }

  function restoreAll() {
    Array.from(applied.keys()).forEach(restoreSection);
  }

  function update() {
    const open = getOpenProjectSection();

    if (!isMobile()) {
      restoreAll();
      return;
    }

    if (!open) {
      restoreAll();
      return;
    }

    // ensure only the open section has mobile applied
    Array.from(applied.keys()).forEach((s) => {
      if (s !== open) restoreSection(s);
    });
    applyMobile(open);
  }

  // Debounce resize
  let rAF = 0;
  const onResize = () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(update);
  };

  document.addEventListener("DOMContentLoaded", () => {
    // initial
    update();

    // When your script opens a project
    document.addEventListener("project:open", () => update());

    // When projects close (body.has-open removed), catch via mutation
    const mo = new MutationObserver(() => update());
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", onResize, { passive: true });
  });
})();
