"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-5" role="status" aria-label="Analyzing food label">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-transparent animate-spin animation-delay-150" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      <div className="text-center">
        <p className="text-slate-200 font-semibold text-sm">Analyzing your food label...</p>
        <p className="text-slate-500 text-xs mt-1">Gemini AI is reviewing ingredients & nutrition</p>
      </div>
    </div>
  );
}
