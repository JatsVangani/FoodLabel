"use client";

import { useState, useEffect } from "react";
import { PROFILE_LABELS, type HealthProfile } from "@/lib/prompts";
import { STORAGE_KEY_PROFILE } from "@/lib/constants";
import Link from "next/link";

const ALL_PROFILES: HealthProfile[] = [
  "diabetes",
  "hypertension",
  "nut_allergy",
  "gluten_intolerance",
  "dairy_allergy",
];

const PROFILE_DESCRIPTIONS: Record<HealthProfile, string> = {
  diabetes: "Flags high sugar and refined carbohydrates",
  hypertension: "Flags high sodium and saturated fat",
  nut_allergy: "Alerts on any nut-derived ingredients",
  gluten_intolerance: "Alerts on gluten-containing ingredients",
  dairy_allergy: "Alerts on dairy-derived ingredients",
};

export default function ProfilePage() {
  const [selected, setSelected] = useState<HealthProfile[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) setSelected(JSON.parse(stored));
    } catch (e) {
      console.warn("Failed to load health profile from localStorage:", e);
    }
  }, []);

  function toggle(profile: HealthProfile) {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(profile)
        ? prev.filter((p) => p !== profile)
        : [...prev, profile]
    );
  }

  function save() {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(selected));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearAll() {
    setSelected([]);
    setSaved(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" id="back-home" className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-5 transition-colors">
          ← Back to Analyzer
        </Link>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Health Profile
        </h1>
        <p className="text-slate-400 text-sm">
          Select your conditions so FoodLabel AI personalizes verdicts for you.
        </p>
      </div>

      {/* Profile cards */}
      <div className="space-y-3 mb-8" role="group" aria-label="Health conditions">
        {ALL_PROFILES.map((profile) => {
          const isSelected = selected.includes(profile);
          return (
            <button
              id={`profile-${profile}`}
              key={profile}
              onClick={() => toggle(profile)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all duration-200 group ${
                isSelected
                  ? "border-violet-500/60 bg-violet-500/15 shadow-md shadow-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div>
                <p className={`font-semibold text-sm ${isSelected ? "text-violet-200" : "text-slate-200"}`}>
                  {PROFILE_LABELS[profile]}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {PROFILE_DESCRIPTIONS[profile]}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isSelected
                    ? "border-violet-500 bg-violet-500"
                    : "border-white/30 group-hover:border-white/50"
                }`}
              >
                {isSelected && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="save-profile-button"
          onClick={save}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm
            bg-gradient-to-r from-violet-600 to-indigo-600 text-white
            hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25
            transition-all duration-200 active:scale-[0.98]"
        >
          {saved ? "✅ Saved!" : "Save Profile"}
        </button>
        <button
          id="clear-profile-button"
          onClick={clearAll}
          className="px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-400
            border border-white/10 hover:border-white/20 hover:text-slate-200
            transition-all duration-200 active:scale-[0.98]"
        >
          Clear
        </button>
      </div>

      {selected.length === 0 && (
        <p className="text-center text-xs text-slate-600 mt-5">
          No conditions selected — verdicts will be for a general audience.
        </p>
      )}
    </div>
  );
}
