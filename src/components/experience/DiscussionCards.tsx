"use client";

import Link from 'next/link';

// Definisikan tipe data meeting agar TypeScript tidak error
interface Meeting {
  id: string;
  title: string;
  room_name: string;
  description?: string;
  moderator?: {
    name: string;
    avatar?: string;
  };
}

interface DiscussionCardsProps {
  items: Meeting[];
}

export default function DiscussionCards({ items = [] }: DiscussionCardsProps) {
  // Ambil 1 diskusi terbaru untuk kolom "Diskusi Terbaru"
  const latestMeeting = items.length > 0 ? items[0] : null;

  // Ambil sisa diskusi untuk kolom "Lanjutkan Diskusi"
  const continuedMeetings = items.slice(1, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

      {/* SEKSI 1: Lanjutkan Diskusi (List dari Database) */}
      <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between mb-4">
          <h4 className="font-bold text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Diskusi Aktif
          </h4>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Belum ada diskusi aktif...</p>
          ) : (
            items.map((item) => (
              <Link href={`/peserta/experience/${item.id}`} key={item.id} className="block group">
                <div className="flex items-center gap-4 hover:bg-slate-50 p-2 rounded-xl transition-all">
                  <img
                    src={`https://i.pravatar.cc/150?u=${item.id}`} // Avatar unik per meeting
                    alt={item.title}
                    className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `40%` }} // Anda bisa ganti dengan logik jumlah peserta
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">
                    Join
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* SEKSI 2: Diskusi Terbaru Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Terbaru</h4>
        {latestMeeting ? (
          <Link href={`/experience/${latestMeeting.id}`}>
            <div className="flex gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 overflow-hidden border border-blue-50">
                <img src="https://i.pravatar.cc/150?u=recent" alt="Avatar" className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{latestMeeting.title}</p>
                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                  {latestMeeting.description || "Klik untuk bergabung ke diskusi video ini."}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <p className="text-[11px] text-slate-400">Kosong</p>
        )}
      </div>

      {/* SEKSI 3: Tombol Buat Topik (Link ke Form) */}
      {/* <Link href="/experience/create" className="flex">
        <button className="flex-1 mt-12 mb-12 ml-4 mr-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-blue-200 transition-transform active:scale-95 px-6 py-4 md:py-0 text-center">
          Buat Topik Baru
        </button>
      </Link> */}
    </div>
  );
}