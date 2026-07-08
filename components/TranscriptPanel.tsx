"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptEntry } from "@/lib/voice/useRealtimeVoice";

/** Collapsible left panel with the running conversation, open by default. */
export function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }) {
  const [open, setOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, open]);

  if (!open) {
    return (
      <div className="hidden lg:flex flex-col items-center bg-jb-red-dark/60 border-r border-white/10 w-11 py-3 shrink-0">
        <button
          onClick={() => setOpen(true)}
          aria-label="Buksan ang transcript"
          className="text-white/70 hover:text-white text-lg"
        >
          💬
        </button>
        <span className="mt-3 text-[9px] font-semibold tracking-[0.2em] uppercase text-white/50 [writing-mode:vertical-rl]">
          Transcript
        </span>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col bg-jb-red-dark/60 border-r border-white/10 w-72 shrink-0 min-h-0">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/60">
          Transcript
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Isara ang transcript"
          className="text-white/60 hover:text-white text-sm font-bold px-1"
        >
          ‹
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 min-h-0">
        {entries.length === 0 ? (
          <p className="text-xs text-white/45">
            Lalabas dito ang usapan niyo ni Joy kapag nagsimula na kayo.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id}>
              <p
                className={`text-[9.5px] font-semibold uppercase tracking-wider mb-0.5 ${
                  entry.role === "assistant" ? "text-jb-yellow" : "text-white/55"
                }`}
              >
                {entry.role === "assistant" ? "Joy" : "Kayo"}
              </p>
              <p className="text-[12.5px] leading-snug text-white/90">{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
