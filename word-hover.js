// word-hover.js
// Grossit chaque mot de 10% au survol, partout SAUF dans les titres .PROJET
// Fonctionne aussi pour le texte injecté dynamiquement (content.js, innerHTML, textContent, etc.)

(function () {
  const EXCLUDED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG"]);
  const EXCLUDED_SELECTORS = [".PROJET"]; // ne pas traiter ces éléments ni leurs descendants
  const WORD_CLASS = "word-hover";

  function isExcludedElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (EXCLUDED_TAGS.has(el.tagName)) return true;
    for (const sel of EXCLUDED_SELECTORS) {
      if (el.closest(sel)) return true;
    }
    return false;
  }

  function wrapTextNode(node) {
    const text = node.nodeValue;
    if (!text || !text.trim()) return;

    // Ne rien faire si le parent est déjà un span.word-hover
    const parent = node.parentElement;
    if (parent && parent.classList && parent.classList.contains(WORD_CLASS)) return;

    // Découpe en "mots" en conservant espaces/ponctuation
    const parts = text.split(/(\s+|[^\p{L}\p{N}’'\u00C0-\u017F]+)/u);
    const frag = document.createDocumentFragment();

    for (const part of parts) {
      if (!part) continue;
      // Séparateurs : espaces/sauts/ponctuation -> on les laisse tels quels
      if (/\s+|[^\p{L}\p{N}’'\u00C0-\u017F]+/u.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement("span");
        span.className = WORD_CLASS;
        span.textContent = part;
        frag.appendChild(span);
      }
    }

    node.parentNode.replaceChild(frag, node);
  }

  function processRoot(root) {
    if (!root) return;
    // Si la racine elle-même est exclue, on s'arrête
    if (root.nodeType === 1 && isExcludedElement(root)) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(textNode) {
          const parent = textNode.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (isExcludedElement(parent)) return NodeFilter.FILTER_REJECT;
          if (!textNode.nodeValue || !textNode.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          // Évite de wrapper un texte déjà dans un span.word-hover
          if (parent.classList && parent.classList.contains(WORD_CLASS)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const toWrap = [];
    let node;
    while ((node = walker.nextNode())) {
      toWrap.push(node);
    }
    toWrap.forEach(wrapTextNode);
  }

  function injectStyles() {
    if (document.getElementById("word-hover-style")) return;
    const style = document.createElement("style");
    style.id = "word-hover-style";
    style.textContent = `
      .${WORD_CLASS} {
        display: inline-block;
        transition: transform 0.15s ease;
        transform-origin: 50% 80%;
      }
      .${WORD_CLASS}:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }

  // Debounce util
  function debounce(fn, delay = 60) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // API publique si on veut appeler manuellement après un rendu custom
  function applyWordHover(root = document.body) {
    injectStyles();
    processRoot(root);
  }

  // Expose en global pour que content.js puisse appeler si besoin
  window.applyWordHover = applyWordHover;

  function autoInit() {
    applyWordHover(document.body);

    // Observe toutes les mutations : ajout de nœuds et changements de texte
    const debouncedProcess = debounce((target) => {
      let root = target && target.nodeType === 3 ? target.parentElement : target;
      if (!root) root = document.body;
      if (root && isExcludedElement(root)) return;
      applyWordHover(root);
    }, 80);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") {
          debouncedProcess(m.target);
        } else if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && !isExcludedElement(n)) {
              debouncedProcess(n);
            } else if (n.nodeType === 3) {
              debouncedProcess(n);
            }
          });
        }
      }
    });

    mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
