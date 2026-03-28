"use client";

import { useState, useRef } from "react";

interface LabelInputProps {
  onSubmit: (
    mode: "text" | "image",
    content?: string,
    imageBase64?: string,
    mimeType?: string
  ) => void;
  loading: boolean;
}

export default function LabelInput({ onSubmit, loading }: LabelInputProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File | null) {
    if (!file) return;
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (activeTab === "text") {
      if (!text.trim()) return;
      onSubmit("text", text);
    } else {
      if (!imagePreview) return;
      onSubmit("image", undefined, imagePreview, imageMime);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(["text", "image"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-violet-600/20 text-violet-300 border-b-2 border-violet-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {tab === "text" ? "📋 Paste Label Text" : "📸 Scan Label Image"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === "text" ? (
          <textarea
            id="label-text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste ingredients and nutrition facts here...\n\nExample:\nIngredients: Sugar, Enriched Flour, Salt...\nServing Size: 30g | Calories: 120 | Sodium: 340mg | Total Sugar: 18g`}
            className="w-full h-44 bg-transparent text-slate-200 placeholder-slate-500 text-sm leading-relaxed resize-none outline-none scrollbar-thin scrollbar-thumb-white/10"
            disabled={loading}
          />
        ) : (
          <div
            id="image-upload-area"
            className={`flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
              dragOver
                ? "border-violet-400 bg-violet-500/10"
                : "border-white/20 hover:border-violet-500/50 hover:bg-white/5"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileChange(e.dataTransfer.files[0]);
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Food label preview"
                className="max-h-40 rounded-lg object-contain"
              />
            ) : (
              <>
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-slate-400">
                  Drop image here or <span className="text-violet-400 font-medium">click to upload</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP supported</p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        <button
          id="analyze-button"
          onClick={handleSubmit}
          disabled={loading || (activeTab === "text" ? !text.trim() : !imagePreview)}
          className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200
            bg-gradient-to-r from-violet-600 to-indigo-600 text-white
            hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
            active:scale-[0.98]"
        >
          {loading ? "Analyzing..." : "Analyze Label →"}
        </button>
      </div>
    </div>
  );
}
