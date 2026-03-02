"use client";

import Sidebar from '@/components/Sidebar';
import ToolsGrid from '@/components/tools/ToolsGrid';
import MentorCard from '@/components/tools/MentorCard';

export default function Tools() {
  return (
    <Sidebar>
      <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Tools Pendukung</h1>
          <p className="text-slate-600 font-medium">
            Ini adalah alat bantu kamu untuk menyelesaikan E-Learning LITERA
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
            <ToolsGrid />
          </div>

          {/* Sidebar Area (Mentor) */}
          <div className="lg:w-80">
            <MentorCard />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}