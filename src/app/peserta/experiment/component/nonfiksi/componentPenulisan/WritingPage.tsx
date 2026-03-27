"use client";

import React from "react";

interface WritingPageProps {
  index: number;

  currentPage: number;

  isLoading: boolean;

  selectedFontSize: string;

  selectedFontFamily: string;

  onFocus: () => void;

  onInput: () => void;

  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;

  innerRef: (el: HTMLDivElement | null) => void;
}

export default function WritingPage({
  index,

  currentPage,

  isLoading,

  selectedFontSize,

  selectedFontFamily,

  onFocus,

  onInput,

  onKeyDown,

  innerRef,
}: WritingPageProps) {
  return (
    <div className="relative group writing-page-container">
      <div
        className={`hidden lg:block absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-black opacity-100 scale-110" : "text-slate-100 opacity-30"}`}
      >
        {index + 1}
      </div>

      <div
        ref={innerRef}
        contentEditable={!isLoading}
        suppressContentEditableWarning={false}
        onFocus={onFocus}
        onInput={onInput}
        onKeyDown={onKeyDown}
        className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div origin-top"
        style={{
          width: "210mm",

          height: "297mm",

          padding: "2.54cm",

          fontSize: selectedFontSize,

          fontFamily: selectedFontFamily,

          lineHeight: "1.6",

          overflow: "hidden",

          boxSizing: "border-box",

          wordBreak: "break-word",
        }}
      />
    </div>
  );
}
