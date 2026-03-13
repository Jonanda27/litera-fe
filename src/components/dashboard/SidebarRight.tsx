"use client";
import { motion } from 'framer-motion';

export function SidebarRight() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Diskusi Terbaru */}
      <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 text-sm md:text-base">Diskusi Terbaru</h3>
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-blue-100 shrink-0">
            <img src="https://i.pravatar.cc/150?u=dewi" alt="Dewi" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-bold text-slate-700 truncate">Dewi Malam</p>
            <p className="text-[10px] md:text-xs text-slate-500 leading-tight line-clamp-2 mt-0.5">Buku Menghadapi Anak-anak Gen-Z</p>
          </div>
        </div>
      </section>

      {/* Gabung Live Session */}
      <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-[#c31a26]">
          <span className="text-lg md:text-xl shrink-0">✳️</span>
          <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">Gabung Live Session</h3>
        </div>
        <div className="flex gap-3 items-center mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
            <img src="https://i.pravatar.cc/150?u=prabawa" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] md:text-xs min-w-0">
            <p className="font-bold text-slate-800 truncate">Menulis Cerpen</p>
            <p className="text-slate-500 truncate mt-0.5">Prabawa Subiyanta</p>
            <p className="text-slate-500 mt-0.5">Sabtu, 18/02/2026, 20.00</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 md:py-2 bg-[#c31a26] text-white font-bold rounded-lg text-xs md:text-sm shadow-md shadow-red-200"
        >
          LINK ZOOM
        </motion.button>
      </section>

      {/* Kontak Mentor */}
      <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 text-sm md:text-base">Kontak Mentor Kamu</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-green-100 shrink-0">
              <img src="https://i.pravatar.cc/150?u=linda" alt="Linda" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-800 truncate">Linda Saragih</p>
              <button className="text-[10px] md:text-xs text-slate-400 hover:text-blue-600 transition-colors">Mulai chat</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}