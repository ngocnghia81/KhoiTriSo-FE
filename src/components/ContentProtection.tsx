"use client";

import { useEffect, useState } from "react";
import { useContentProtection } from "@/hooks/useContentProtection";

/**
 * Component bảo vệ nội dung với overlay mờ để chặn PrintScreen
 * Sử dụng overlay để làm mờ màn hình khi người dùng cố chụp màn hình
 */
export default function ContentProtection({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);
  useContentProtection();

  useEffect(() => {
    // Overlay mờ để chặn PrintScreen (giới hạn hiệu quả)
    // Kích hoạt overlay khi phát hiện các hành động có thể là PrintScreen
    
    let overlayTimeout: NodeJS.Timeout;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows: PrintScreen, Ctrl + PrintScreen
      if (e.key === "PrintScreen" || e.key === "Print" || (e.ctrlKey && e.key === "PrintScreen")) {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 500);
      }

      // Windows: Shift + PrintScreen, Alt + PrintScreen
      if (
        (e.shiftKey || e.altKey) &&
        (e.key === "PrintScreen" || e.key === "Print")
      ) {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 500);
      }

      // Windows: Windows + Shift + S (Snipping Tool)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "S") {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 1000);
      }

      // macOS: Cmd + Shift + 3 (Chụp toàn màn hình)
      // macOS: Cmd + Shift + 4 (Chụp vùng chọn)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 1000);
      }

      // macOS: Cmd + Shift + Control + 3/4 (Copy vào clipboard)
      if (e.metaKey && e.shiftKey && e.ctrlKey && (e.key === "3" || e.key === "4")) {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 1000);
      }

      // Linux: PrintScreen, Shift + PrintScreen, Alt + PrintScreen
      if (
        e.key === "PrintScreen" ||
        e.key === "Print" ||
        (e.shiftKey && (e.key === "PrintScreen" || e.key === "Print")) ||
        (e.altKey && (e.key === "PrintScreen" || e.key === "Print"))
      ) {
        setShowOverlay(true);
        overlayTimeout = setTimeout(() => setShowOverlay(false), 500);
      }
    };

    // Phát hiện khi người dùng cố mở DevTools
    let devToolsOpen = false;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          setShowOverlay(true);
          overlayTimeout = setTimeout(() => setShowOverlay(false), 1000);
        }
      } else {
        devToolsOpen = false;
      }
    };

    const devToolsInterval = setInterval(checkDevTools, 500);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(devToolsInterval);
      if (overlayTimeout) clearTimeout(overlayTimeout);
    };
  }, []);

  return (
    <>
      {children}
      {/* Overlay mờ để chặn PrintScreen */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[99999] pointer-events-none"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          aria-hidden="true"
        />
      )}
      {/* CSS để chặn selection và copy */}
      <style jsx global>{`
        /* Chặn selection trên toàn bộ trang, trừ các element được phép */
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Cho phép selection trên input, textarea và các element được phép */
        input,
        textarea,
        [contenteditable="true"],
        [contenteditable=""],
        .allow-select,
        .allow-copy {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
          -webkit-touch-callout: default;
        }

        /* Chặn drag images */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          pointer-events: none;
        }

        /* Cho phép drag trên các element được phép */
        .allow-drag img,
        .allow-drag {
          -webkit-user-drag: auto;
          user-drag: auto;
          pointer-events: auto;
        }

        /* Chặn text selection highlight */
        ::selection {
          background: transparent;
        }

        ::-moz-selection {
          background: transparent;
        }

        /* Cho phép selection highlight trên các element được phép */
        input::selection,
        textarea::selection,
        [contenteditable="true"]::selection,
        [contenteditable=""]::selection,
        .allow-select::selection,
        .allow-copy::selection {
          background: rgba(59, 130, 246, 0.3);
        }

        /* Chặn context menu trên images */
        img {
          pointer-events: none;
        }

        /* Disable print styles */
        @media print {
          * {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

