"use client";

import { FLAG_LABELS } from "@/lib/prompts";

type Verdict = "good" | "okay" | "avoid";

interface VerdictCardProps {
  verdict: Verdict;
  reason: string;
  flags: string[];
}

const verdictConfig = {
  good: {
    label: "Good Choice",
    emoji: "✅",
    bg: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500 text-white",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  okay: {
    label: "Okay in Moderation",
    emoji: "⚠️",
    bg: "from-amber-500/20 to-yellow-600/10",
    border: "border-amber-500/40",
    badge: "bg-amber-500 text-white",
    glow: "shadow-amber-500/20",
    text: "text-amber-400",
    ring: "ring-amber-500/30",
  },
  avoid: {
    label: "Avoid",
    emoji: "🚫",
    bg: "from-red-500/20 to-red-700/10",
    border: "border-red-500/40",
    badge: "bg-red-500 text-white",
    glow: "shadow-red-500/20",
    text: "text-red-400",
    ring: "ring-red-500/30",
  },
};

export default function VerdictCard({ verdict, reason, flags }: VerdictCardProps) {
  const config = verdictConfig[verdict];

  return (
    <div
      className={`rounded-2xl border ${config.border} bg-gradient-to-br ${config.bg} p-6 shadow-2xl ${config.glow} backdrop-blur-sm ring-1 ${config.ring} animate-fade-in`}
      role="region"
      aria-label="Health verdict result"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="text-5xl drop-shadow-lg">{config.emoji}</div>
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${config.badge} shadow-md mb-1`}>
            {config.label}
          </span>
          <p className={`text-lg font-semibold leading-snug ${config.text}`}>
            {reason}
          </p>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            Detected Concerns
          </p>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <span
                key={flag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/10 backdrop-blur-sm"
              >
                {FLAG_LABELS[flag] ?? flag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
