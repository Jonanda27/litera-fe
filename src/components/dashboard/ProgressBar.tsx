import { motion } from 'framer-motion';

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="relative w-full bg-[#1e4e8c] h-10 rounded-full overflow-hidden shadow-inner border-4 border-white">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-0 left-0 h-full bg-[#c31a26] flex items-center justify-center"
      >
        <span className="text-white font-bold text-sm whitespace-nowrap px-4">
          Progres kamu {progress}%
        </span>
      </motion.div>
    </div>
  );
}