"use client";
import { motion } from 'framer-motion';

export function SidebarRight() {
  return (
    <div className="space-y-6">
      {/* Diskusi Terbaru */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Diskusi Terbaru</h3>
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 shrink-0">
            <img src="https://i.pravatar.cc/150?u=dewi" alt="Dewi" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Dewi Malam</p>
            <p className="text-xs text-slate-500 leading-tight">Buku Menghadapi Anak-anak Gen-Z</p>
          </div>
        </div>
      </section>

      {/* Gabung Live Session */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-[#c31a26]">
          <span className="text-xl">✳️</span>
          <h3 className="font-bold text-slate-800">Gabung Live Session</h3>
        </div>
        <div className="flex gap-3 items-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
            <img src="https://i.pravatar.cc/150?u=prabawa" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800">Menulis Cerpen</p>
            <p className="text-slate-500">Prabawa Subiyanta</p>
            <p className="text-slate-500">Sabtu, 18/02/2026, 20.00</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 bg-[#c31a26] text-white font-bold rounded-lg text-sm shadow-md shadow-red-200"
        >
          LINK ZOOM
        </motion.button>
      </section>

      {/* Kontak Mentor */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Kontak Mentor Kamu</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-100 shrink-0">
            <img src="https://i.pravatar.cc/150?u=linda" alt="Linda" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Linda saragih</p>
            <button className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Mulai chat</button>
          </div>
        </div>
      </section>
    </div>
  );
}