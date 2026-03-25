import React from "react";
import { Template } from "./TemplateData";

interface CoverCanvasProps {
  template: Template;
  editTitle: string;
  editSubtitle: string;
  editAuthor: string;
  pageSize: "A4" | "B5";
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export const CoverCanvas = ({ template, editTitle, editSubtitle, editAuthor, pageSize, innerRef }: CoverCanvasProps) => {
  return (
    <div
      ref={innerRef}
      style={{
        aspectRatio: pageSize === "A4" ? "210/297" : "176/250",
        width: "100%",
      }}
      className="relative bg-black shadow-2xl overflow-hidden rounded-sm transition-all duration-500 mx-auto"
    >
      <img src={template.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="bg" />
      <div className="absolute inset-0 flex flex-col justify-between py-12 px-6 z-10 text-center">
        <div className="mt-16 flex flex-col items-center">
          <h2 className={`${template.titleColor} font-black text-4xl uppercase leading-[0.9] tracking-tighter break-words w-full drop-shadow-lg`}>
            {editTitle || template.title}
          </h2>
          <div className={`w-16 h-1 ${template.accentColor} my-6 rounded-full`}></div>
          <p className="text-white text-[10px] font-medium leading-relaxed px-4 drop-shadow-md">
            {editSubtitle || template.subtitle}
          </p>
        </div>
        <p className={`${template.authorColor} font-bold text-[11px] tracking-[0.4em] uppercase drop-shadow-md`}>
          {editAuthor || template.author}
        </p>
      </div>
    </div>
  );
};