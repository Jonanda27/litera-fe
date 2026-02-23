"use client";
import { ExModuleCard } from './ExModuleCard';

export function ExContentArea() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      {/* Header Level Info */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-xl font-black text-slate-800">Level-1/Modul-1</h2>
          <span className="text-[#C31A26] font-bold text-sm italic">
            Saat ini kamu sedang menyelesaikan pelajaran "Mindset keuangan Sehat 2"
          </span>
        </div>
        <button className="bg-[#1E4E8C] text-white px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110">
          Lihat Sertifikat Kamu
        </button>
      </div>

      {/* Grid Baris 1: Membaca (6 Kolom) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <ExModuleCard title="Memahami Membaca Sehat 1" type="book" status="done" />
        <ExModuleCard title="Memahami Membaca Sehat 1" type="book" status="active" />
        <ExModuleCard title="Memahami Membaca Sehat 1" type="book" status="locked" />
        <ExModuleCard title="Memahami Membaca Sehat 1" type="book" status="locked" />
        <ExModuleCard title="Memahami Membaca Sehat 1" type="book" status="locked" />
        <ExModuleCard title="Evaluasi Memahami membaca Sehat" type="book" status="locked" />
      </div>

      {/* Grid Baris 2: Menulis (5 Kolom) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <ExModuleCard title="Mindset Menulis Sehat 1" type="video" status="done" />
        <ExModuleCard title="Mindset Menulis Sehat 2" type="video" status="active" />
        <ExModuleCard title="Mindset Menulis Sehat 3" type="video" status="locked" />
        <ExModuleCard title="Mindset Menulis Sehat 4" type="video" status="locked" />
        <ExModuleCard title="Mindset Menulis Sehat 5" type="video" status="locked" />
      </div>

      <div className="mt-8 flex justify-end">
        <button className="text-[#1E4E8C] font-black text-sm italic hover:mr-1 transition-all">
          Lanjut Ke Level-1/Modul-2 &gt;&gt;
        </button>
      </div>
    </div>
  );
}