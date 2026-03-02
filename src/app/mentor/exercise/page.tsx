"use client";

import Sidebar from '@/components/Sidebar';
import { ExProgressBar } from '@/components/exercise/ExProgressBar';
import { ExModuleItem } from '@/components/exercise/ExModuleItem';
import { ExFooterTools } from '@/components/exercise/ExFooterTools';

export default function ExercisePage() {
  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header Title */}
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">EXERCISE</h1>
          <p className="text-slate-800 font-bold text-lg">
            Ini adalah ruang belajar kamu. Silahkan kamu mulai dari Level-1/Modul-1 dan seterusnya.
          </p>
        </header>

        {/* Progress Section */}
        <ExProgressBar progress={26} />

        {/* Main Content Area */}
        <div className="bg-[#f8fafc] rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          {/* Sub Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">
              Level-1/Modul-1 <span className="text-[#c31a26] font-bold text-sm italic ml-2">Saat ini kamu sedang menyelesaikan pelajaran "Mindset keuangan Sehat 2"</span>
            </h2>
            <button className="bg-[#1e4e8c] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg">
              Lihat Sertifikat Kamu
            </button>
          </div>

          {/* Grid Row 1 (Books - 6 Columns) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <ExModuleItem title="Memahami Membaca Sehat 1" type="book" />
            <ExModuleItem title="Memahami Membaca Sehat 1" type="book" active />
            <ExModuleItem title="Memahami Membaca Sehat 1" type="book" locked />
            <ExModuleItem title="Memahami Membaca Sehat 1" type="book" locked />
            <ExModuleItem title="Memahami Membaca Sehat 1" type="book" locked />
            <ExModuleItem title="Evaluasi Memahami membaca Sehat" type="book" locked />
          </div>

          {/* Grid Row 2 (Videos - 5 Columns) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ExModuleItem title="Mindset Menulis Sehat 1" type="video" />
            <ExModuleItem title="Mindset Menulis Sehat 2" type="video" active />
            <ExModuleItem title="Mindset Menulis Sehat 3" type="video" locked />
            <ExModuleItem title="Mindset Menulis Sehat 4" type="video" locked />
            <ExModuleItem title="Mindset Menulis Sehat 5" type="video" locked />
          </div>

          {/* Next Link */}
          <div className="mt-8 flex justify-end">
            <button className="text-[#1e4e8c] font-black text-sm italic hover:mr-2 transition-all">
              Lanjut Ke Level-1/Modul-2 &gt;&gt;
            </button>
          </div>
        </div>

        {/* Footer Area */}
        <ExFooterTools />
      </div>
    </Sidebar>
  );
}