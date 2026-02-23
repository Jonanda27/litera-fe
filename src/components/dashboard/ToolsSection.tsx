"use client";

export function ToolsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Tools Pendukung */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 text-lg">Tools Pendukung</h3>
        <div className="flex flex-wrap gap-8 items-center justify-start">
          {['📚', '🏠', '✍️', '📖', '💼'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl mb-2">{icon}</span>
              <div className={`h-3 w-12 rounded-full ${['bg-red-500', 'bg-lime-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i]}`} />
            </div>
          ))}
        </div>
      </div>

     
    </div>
  );
}