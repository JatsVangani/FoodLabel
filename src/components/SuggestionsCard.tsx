"use client";

interface Suggestion {
  name: string;
  why: string;
}

interface SuggestionsCardProps {
  alternatives: Suggestion[];
  tip: string;
}

export default function SuggestionsCard({ alternatives, tip }: SuggestionsCardProps) {
  return (
    <div
      className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 p-6 shadow-xl backdrop-blur-sm ring-1 ring-blue-500/20 animate-fade-in"
      role="region"
      aria-label="Healthier alternatives"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">💡</div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300">
          Healthier Alternatives
        </h3>
      </div>

      <div className="space-y-3 mb-5">
        {alternatives.map((alt, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            <span className="text-lg mt-0.5 flex-shrink-0">
              {["🥇", "🥈", "🥉"][i] ?? "•"}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-200">{alt.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{alt.why}</p>
            </div>
          </div>
        ))}
      </div>

      {tip && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Nutrition Tip
          </p>
          <p className="text-sm text-slate-300">{tip}</p>
        </div>
      )}
    </div>
  );
}
