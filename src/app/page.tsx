"use client";

import { useState, useEffect, useRef } from "react";
import LabelInput from "@/components/LabelInput";
import VerdictCard from "@/components/VerdictCard";
import HealthProfileBadge from "@/components/HealthProfileBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import SuggestionsCard from "@/components/SuggestionsCard";
import type { HealthProfile } from "@/lib/prompts";

interface AnalysisResult {
  verdict: "good" | "okay" | "avoid";
  reason: string;
  flags: string[];
}

interface SuggestResult {
  alternatives: { name: string; why: string }[];
  tip: string;
}

export default function HomePage() {
  const [profile, setProfile] = useState<HealthProfile[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<SuggestResult | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Track the last submitted label text for suggestions
  const lastLabelRef = useRef<string>("");

  // Load profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("health_profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  async function handleAnalyze(
    mode: "text" | "image",
    content?: string,
    imageBase64?: string,
    mimeType?: string
  ) {
    setLoading(true);
    setResult(null);
    setError(null);
    setSuggestions(null);

    // Store the label text for use in suggestions
    lastLabelRef.current = content || "Food label from uploaded image";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, content, imageBase64, mimeType, profile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetSuggestions() {
    if (!result) return;

    setSuggestLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalLabel: lastLabelRef.current,
          verdict: result.verdict,
          flags: result.flags,
          profile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get suggestions");
      }

      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suggestions");
    } finally {
      setSuggestLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-widest mb-5">
          <span className="animate-pulse">●</span> AI-Powered Analysis
        </div>
        <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
          Know What You&apos;re <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Eating</span>
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">
          Paste ingredients or snap a food label — get an instant{" "}
          <strong className="text-slate-300">plain-English verdict</strong> personalized for your health.
        </p>
      </div>

      {/* Active profile */}
      {profile.length > 0 && (
        <div className="mb-4">
          <HealthProfileBadge profile={profile} />
        </div>
      )}

      {profile.length === 0 && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-2.5">
          <span className="text-lg">💡</span>
          <span>
            <a href="/profile" className="font-semibold underline underline-offset-2 hover:text-amber-200">
              Set your health profile
            </a>{" "}
            for a personalized verdict (diabetes, hypertension, allergies)
          </span>
        </div>
      )}

      {/* Input */}
      <LabelInput onSubmit={handleAnalyze} loading={loading} />

      {/* Loading */}
      {loading && (
        <div className="mt-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          <VerdictCard
            verdict={result.verdict}
            reason={result.reason}
            flags={result.flags}
            profile={profile}
          />

          {/* Suggestions CTA */}
          {!suggestions && !suggestLoading && (
            <button
              id="get-suggestions-button"
              onClick={handleGetSuggestions}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white
                hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-blue-500/20
                active:scale-[0.98]"
            >
              💡 Get Healthier Alternatives
            </button>
          )}

          {/* Suggestions loading */}
          {suggestLoading && (
            <div className="flex items-center justify-center gap-3 py-6 text-slate-400 text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              Finding healthier alternatives...
            </div>
          )}

          {/* Suggestions result */}
          {suggestions && <SuggestionsCard alternatives={suggestions.alternatives} tip={suggestions.tip} />}

          <p className="text-center text-xs text-slate-600 mt-4">
            This is not medical advice. Consult a healthcare professional for personal guidance.
          </p>
        </div>
      )}
    </div>
  );
}
