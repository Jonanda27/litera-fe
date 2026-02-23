"use client";

interface ExpProjectCardProps {
  title: string;
  lastUpdate: string;
  obstacle: string;
}

export function ExpProjectCard({ title, lastUpdate, obstacle }: ExpProjectCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center mb-4">
      <div className="flex gap-4">
        {/* Icon Buku & Kalkulator */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <span className="text-5xl">📖</span>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-md shadow-sm p-0.5 border border-slate-100">
             <span className="text-xl">🧮</span>
          </div>
        </div>

        {/* Informasi Proyek */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800 leading-tight">Proyek: {title}</h3>
          <p className="text-sm font-bold text-slate-700">Update terakhir: {lastUpdate}</p>
          <p className="text-sm font-bold text-slate-700 italic">
            <span className="not-italic">Kendala:</span> {obstacle}
          </p>
        </div>
      </div>

      {/* Tombol Aksi */}
      <button className="bg-[#1E4E8C] text-white px-10 py-2 rounded-xl font-black text-sm shadow-lg hover:bg-blue-800 transition-colors">
        Buka
      </button>
    </div>
  );
}