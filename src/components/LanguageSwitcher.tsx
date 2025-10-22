"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (lang: "vi" | "en") => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative z-[2000]" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {language.toUpperCase()}
        <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-[9999] mt-2 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
        >
          {["vi", "en"].map((opt) => (
            <button
              key={opt}
              role="option"
              aria-selected={language === opt}
              onClick={() => select(opt as "vi" | "en")}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                language === opt ? "bg-blue-600 text-white hover:bg-blue-600" : "text-gray-800"
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


