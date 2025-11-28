"use client";

import { useEffect } from "react";

/**
 * Hook để bảo vệ nội dung khỏi các hành động không mong muốn:
 * - Chặn chuột phải (context menu)
 * - Chặn bôi đen/chọn văn bản (trừ input/textarea)
 * - Chặn copy/cut/paste (ngoài input/textarea)
 * - Chặn các phím tắt xem mã nguồn
 * - Chặn print, save page
 * - Chặn download (trừ file được phép)
 * - Chặn mở tab mới
 */
export function useContentProtection() {
  useEffect(() => {
    // Danh sách các element được phép select/copy
    const allowedSelectors = [
      "input",
      "textarea",
      "[contenteditable='true']",
      "[contenteditable='']",
      ".allow-select",
      ".allow-copy",
    ];

    // Kiểm tra xem element có được phép không
    const isAllowedElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      
      return allowedSelectors.some((selector) => {
        try {
          return target.matches(selector) || target.closest(selector);
        } catch {
          return false;
        }
      });
    };

    // 1. Chặn chuột phải (context menu)
    const handleContextMenu = (e: MouseEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 2. Chặn bôi đen/chọn văn bản (trừ input/textarea)
    const handleSelectStart = (e: Event) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Chặn copy/cut/paste (ngoài input/textarea)
    const handleCopy = (e: ClipboardEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 4. Chặn các phím tắt xem mã nguồn
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 - DevTools
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I / J / C (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + P (Print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + P (Command Palette trong DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + D (Toggle Device Mode)
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + M (Toggle Device Mode)
      if (e.ctrlKey && e.shiftKey && e.key === "M") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Windows + Shift + S (Snipping Tool - Chụp màn hình Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // macOS: Cmd + Shift + 3 (Chụp toàn màn hình)
      // macOS: Cmd + Shift + 4 (Chụp vùng chọn)
      // macOS: Cmd + Shift + Control + 3/4 (Copy vào clipboard)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.metaKey && e.shiftKey && e.ctrlKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Linux: PrintScreen, Shift + PrintScreen, Alt + PrintScreen
      if (e.key === "PrintScreen" || e.key === "Print") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.shiftKey && (e.key === "PrintScreen" || e.key === "Print")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.altKey && (e.key === "PrintScreen" || e.key === "Print")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Windows + S (Windows Search - có thể dùng để chụp màn hình)
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && !e.shiftKey) {
        // Chỉ chặn nếu không phải Ctrl+S (đã xử lý ở trên)
        if (e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Disable right-click menu shortcuts
      if (e.key === "F10" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 5. Chặn Print
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 6. Chặn download (trừ file được phép)
    const handleDownload = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[download]") as HTMLAnchorElement;
      
      if (link) {
        // Kiểm tra xem link có class "allow-download" không
        if (!link.classList.contains("allow-download")) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // 7. Chặn mở tab mới (trừ link được phép)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[target='_blank']") as HTMLAnchorElement;
      
      if (link) {
        // Kiểm tra xem link có class "allow-new-tab" không
        if (!link.classList.contains("allow-new-tab")) {
          e.preventDefault();
          e.stopPropagation();
          // Mở trong cùng tab thay vì tab mới
          if (link.href) {
            window.location.href = link.href;
          }
          return false;
        }
      }
    };

    // 8. Chặn drag & drop files
    const handleDragStart = (e: DragEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        return false;
      }
    };

    const handleDrag = (e: DragEvent) => {
      if (!isAllowedElement(e.target)) {
        e.preventDefault();
        return false;
      }
    };

    // 9. Chặn inspect element bằng cách disable selection
    const handleMouseDown = (e: MouseEvent) => {
      // Chặn selection bằng cách giữ Shift
      if (e.shiftKey && !isAllowedElement(e.target)) {
        e.preventDefault();
        return false;
      }
    };

    // Thêm event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("download", handleDownload, true);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("drag", handleDrag);
    document.addEventListener("mousedown", handleMouseDown);

    // Chặn download qua các cách khác
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
      const element = originalCreateElement.call(this, tagName, options);
      
      if (tagName.toLowerCase() === "a") {
        const link = element as HTMLAnchorElement;
        const originalSetAttribute = link.setAttribute.bind(link);
        
        link.setAttribute = function (name: string, value: string) {
          if (name === "download" && !link.classList.contains("allow-download")) {
            return; // Không cho set download attribute
          }
          if (name === "target" && value === "_blank" && !link.classList.contains("allow-new-tab")) {
            return; // Không cho mở tab mới
          }
          originalSetAttribute(name, value);
        };
      }
      
      return element;
    };

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("download", handleDownload, true);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("mousedown", handleMouseDown);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    };
  }, []);
}

