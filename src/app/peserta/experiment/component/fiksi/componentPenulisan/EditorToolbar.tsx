"use client";
// Tambahkan icon Heading atau gunakan Lucide Type
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Heading1, Heading2, Heading3, ChevronDown } from "lucide-react";

interface EditorToolbarProps {
  applyStyle: (command: string, value?: any) => void;
  applyFontFamily: (font: string) => void;
  selectedFontFamily: string;
  saveStatus: string;
}

export default function EditorToolbar({
  applyStyle,
  applyFontFamily,
  selectedFontFamily,
  saveStatus
}: EditorToolbarProps) {
    
  return (
    <div className="w-full bg-slate-50 px-3 md:px-6 py-3 md:py-4 border-b-2 border-slate-100 flex overflow-x-auto md:flex-wrap items-center gap-3 md:gap-4 sticky top-0 z-50 shadow-sm text-black no-scrollbar">
      
      {/* Heading Selector */}
      <div className="flex items-center bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm px-2 md:px-3 shrink-0">
        <select 
          onChange={(e) => applyStyle("formatBlock", e.target.value)}
          className="bg-transparent text-[10px] md:text-[11px] font-black outline-none py-2 cursor-pointer text-black"
          defaultValue="p"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>

      {/* Bold, Italic, Underline */}
      <div className="flex bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black shrink-0">
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("bold"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors text-xs">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("italic"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 italic transition-colors text-xs">I</button>
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("underline"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white underline transition-colors text-xs">U</button>
      </div>

      {/* Font Family Selector */}
      <div className="flex items-center bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm px-2 md:px-3 shrink-0">
        <Type size={12} className="text-slate-400 mr-1 md:mr-2" />
        <select value={selectedFontFamily} onChange={(e) => applyFontFamily(e.target.value)} className="bg-transparent text-[10px] md:text-[11px] font-black outline-none py-2 cursor-pointer text-black max-w-[80px] md:max-w-none">
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Arial', sans-serif">Arial</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>
      </div>

      {/* Text Alignment */}
      <div className="flex bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-slate-600 shrink-0">
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyLeft"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignLeft size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyCenter"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignCenter size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyRight"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignRight size={14} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyFull"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"><AlignJustify size={14} /></button>
      </div>

      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-full shadow-lg shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : saveStatus === "Typing..." ? "bg-blue-400 animate-pulse" : "bg-green-400"}`} />
        <span className="text-[8px] font-black text-white uppercase tracking-widest">{saveStatus}</span>
      </div>
    </div>
  );
}