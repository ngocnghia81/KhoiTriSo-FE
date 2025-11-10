'use client';

import { useEffect } from 'react';

interface MathMLRendererProps {
  children: React.ReactNode;
  className?: string;
}

export function MathMLRenderer({ children, className = '' }: MathMLRendererProps) {
  useEffect(() => {
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

    // Convert mfenced elements in the current component
    convertMfenced(document);
  }, []);

  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Hook for manual conversion
export function useMathMLConversion() {
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

  return { convertMfenced };
}

// Utility function for converting MathML content
export function convertMathMLContent(content: string): string {
  // This function can be used to preprocess MathML content before rendering
  // For now, it returns the content as-is, but can be extended for more conversions
  return content;
}
