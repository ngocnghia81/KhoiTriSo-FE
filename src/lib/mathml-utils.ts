// Global MathML utilities for the Khởi Trí Số platform
// This script handles MathML mfenced conversion globally

declare global {
  interface Window {
    convertMfenced: (root: Document | Element) => void;
    mathMLUtils: {
      convertMfenced: (root: Document | Element) => void;
      init: () => void;
    };
  }
}

const convertMfenced = (root: Document | Element) => {
  const ns = "http://www.w3.org/1998/Math/MathML";
  const fencedNodes = root.querySelectorAll("mfenced");

  fencedNodes.forEach(mf => {
    const open = mf.getAttribute("open") ?? "(";
    const close = mf.getAttribute("close") ?? ")";
    const separatorsAttr = mf.getAttribute("separators");
    const separators = separatorsAttr ? separatorsAttr.split("") : [""];

    const mrow = document.createElementNS(ns, "mrow");

    if (open !== "") {
      const moOpen = document.createElementNS(ns, "mo");
      moOpen.textContent = open;
      mrow.appendChild(moOpen);
    }

    const children = Array.from(mf.children);
    children.forEach((child, i) => {
      mrow.appendChild(child.cloneNode(true));
      if (i < children.length - 1) {
        const sep = document.createElementNS(ns, "mo");
        sep.textContent = separators[i] ?? separators[separators.length - 1];
        mrow.appendChild(sep);
      }
    });

    if (close !== "") {
      const moClose = document.createElementNS(ns, "mo");
      moClose.textContent = close;
      mrow.appendChild(moClose);
    }

    mf.replaceWith(mrow);
  });
};

const mathMLUtils = {
  convertMfenced,
  init: () => {
    // Convert existing MathML on page load
    convertMfenced(document);
    
    // Set up observer for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            convertMfenced(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};

// Make utilities globally available
if (typeof window !== 'undefined') {
  window.convertMfenced = convertMfenced;
  window.mathMLUtils = mathMLUtils;
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mathMLUtils.init);
  } else {
    mathMLUtils.init();
  }
}

export { convertMfenced, mathMLUtils };
