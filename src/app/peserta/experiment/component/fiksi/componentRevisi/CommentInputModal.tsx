"use client";
import { motion } from "framer-motion";

interface CommentInputModalProps {
  selectedText: string;
  commentLabel: string;
  setCommentLabel: (val: string) => void;
  commentText: string;
  setCommentText: (val: string) => void;
  addComment: () => void;
  onCancel: () => void;
}

export default function CommentInputModal({
  selectedText,
  commentLabel,
  setCommentLabel,
  commentText,
  setCommentText,
  addComment,
  onCancel
}: CommentInputModalProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-orange-500 w-full max-w-md text-black">
        <h5 className="font-black text-sm uppercase tracking-widest mb-4 text-center">Beri Catatan</h5>
        <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Teks Terpilih:</p>
          <p className="text-xs text-slate-700 line-clamp-2">"{selectedText}"</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 block">Kategori</label>
            <select value={commentLabel} onChange={(e) => setCommentLabel(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 text-xs font-bold outline-none cursor-pointer">
              <option>Cek Fakta</option>
              <option>Tambah Deskripsi</option>
              <option>Plot Hole</option>
              <option>Typo/Ejaan</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 block">Isi Catatan</label>
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Tulis detail revisi di sini..."
              className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 text-xs font-medium outline-none focus:border-orange-400 min-h-[100px] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={addComment} className="flex-[2] py-3 bg-orange-500 text-white text-[10px] font-black rounded-xl uppercase shadow-lg hover:bg-orange-600 transition-colors">Simpan Catatan</button>
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-400 text-[10px] font-black rounded-xl uppercase">Batal</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}