interface ToolCardProps {
  image: string;
  color: string;
  label: string;
}

export default function ToolCard({ image, color, label }: ToolCardProps) {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      {/* Container Gambar */}
      <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-2">
        <img 
          src={image} 
          alt={label} 
          className="w-32 h-32 object-contain drop-shadow-xl"
        />
      </div>
      
      {/* Tombol Berwarna */}
      <div 
        className={`w-32 h-10 rounded-xl border-2 border-yellow-500 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center transition-all active:translate-y-1 active:shadow-none ${color}`}
      >
        <span className="text-white font-bold text-sm tracking-wide shadow-black drop-shadow-sm">
          {label}
        </span>
      </div>
    </div>
  );
}