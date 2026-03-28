"use client";

import { PROFILE_LABELS, type HealthProfile } from "@/lib/prompts";

interface HealthProfileBadgeProps {
  profile: HealthProfile[];
}

export default function HealthProfileBadge({ profile }: HealthProfileBadgeProps) {
  if (profile.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {profile.map((p) => (
        <span
          key={p}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30"
        >
          {PROFILE_LABELS[p]}
        </span>
      ))}
    </div>
  );
}
