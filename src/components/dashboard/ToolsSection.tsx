"use client";

export function ToolsSection() {
  return (
    <div className="grid grid-cols-1 mt-6 md:mt-8">
      {/* Tools Pendukung */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-5 md:mb-6 text-base md:text-lg">Tools Pendukung</h3>
        <div className="flex flex-wrap gap-4 md:gap-8 items-center justify-between sm:justify-start">
          {['📚', '🏠', '✍️', '📖', '💼'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2">{icon}</span>
              <div className={`h-2 md:h-3 w-8 md:w-12 rounded-full ${['bg-red-500', 'bg-lime-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i]}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}