"use client";
import React from "react";

interface RevisionPageProps {
  index: number;
  currentPage: number;
  innerRef: (el: HTMLDivElement | null) => void;
  onMouseUp: () => void;
  onFocus: () => void;
  selectedFontSize: string;
  selectedFontFamily: string;
}

export default function RevisionPage({
  index,
  currentPage,
  innerRef,
  onMouseUp,
  onFocus,
  selectedFontSize,
  selectedFontFamily,
}: RevisionPageProps) {
  return (
    <div className="relative group writing-page-container flex justify-center">
      {/* Nomor Halaman di Samping */}
      <div className={`hidden lg:block absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-slate-900 opacity-100 scale-110" : "text-slate-200 opacity-30"}`}>
        {index + 1}
      </div>

      <div
        ref={innerRef}
        onMouseUp={onMouseUp}
        onFocus={onFocus}
        className="bg-white shadow-2xl outline-none text-black prose prose-slate a4-page-div origin-top"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '2.54cm', // Standar Margin 1 Inci
          fontSize: selectedFontSize,
          fontFamily: selectedFontFamily,
          lineHeight: '1.6',
          overflow: 'hidden',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
          backgroundColor: '#ffffff',
          color: '#000000'
        }}
      />
    </div>
  );
}