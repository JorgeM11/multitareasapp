"use client";

import { useState, useEffect, useRef } from "react";

export default function CustomSelect({ value, onChange, options, id, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const idx = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      } else if (focusedIndex >= 0 && focusedIndex < options.length) {
        handleSelect(options[focusedIndex].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
      } else {
        setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative w-full ${isOpen ? "z-30" : "z-10"}`} ref={containerRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-[9px] md:text-sm font-bold text-slate-200 transition duration-200 hover:border-slate-700 hover:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {selectedOption.icon && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-2xs font-extrabold bg-slate-900 border border-slate-800 text-indigo-400">
              {selectedOption.icon}
            </span>
          )}
          <span>{selectedOption.label}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`h-4 w-4 text-slate-450 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-400" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options dropdown menu with fluid scale & slide animation */}
      <ul
        role="listbox"
        aria-label={label}
        tabIndex={-1}
        className={`absolute z-50 mt-2 max-h-[142px] w-full overflow-y-auto rounded-xl border border-slate-850 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-200 ease-out origin-top ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {options.map((opt, idx) => {
          const isSelected = opt.value === value;
          const isFocused = idx === focusedIndex;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(opt.value)}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : isFocused
                  ? "bg-slate-900 text-white"
                  : "text-slate-355 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.icon && (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold border ${
                      isSelected
                        ? "bg-indigo-750 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-850 text-indigo-400"
                    }`}
                  >
                    {opt.icon}
                  </span>
                )}
                <span>{opt.label}</span>
              </span>

              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
