"use client";

import { useRealtimeVoice } from "@/lib/voice/useRealtimeVoice";

const STATUS_LABEL: Record<string, string> = {
  idle: "Tap to order by voice",
  connecting: "Connecting…",
  listening: "Listening…",
  speaking: "Speaking…",
};

export function VoicePanel({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { status, transcript, liveCaption, errorMessage, start, stop } = useRealtimeVoice({
    openCheckout: onOpenCheckout,
  });

  const isActive = status === "connecting" || status === "listening" || status === "speaking";
  const lastEntries = transcript.slice(-2);
  const showCaptions = lastEntries.length > 0 || Boolean(liveCaption);

  return (
    <div className="border-b border-neutral-200 bg-gradient-to-br from-jb-red to-jb-red-dark text-white p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-2xl">
          🎙️
          {status === "listening" && (
            <span className="absolute inset-0 rounded-full border-2 border-white/70 animate-pulse" />
          )}
          {status === "speaking" && (
            <span className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Joy</p>
          <p className="text-xs text-white/80 truncate">
            {status === "error" ? errorMessage || "Something went wrong" : STATUS_LABEL[status]}
          </p>
        </div>
      </div>

      {showCaptions && (
        <div className="bg-black/20 rounded-lg p-2 text-xs space-y-1 max-h-20 overflow-y-auto">
          {lastEntries.map((entry) => (
            <p key={entry.id}>
              <span className="font-semibold">{entry.role === "user" ? "You" : "Joy"}:</span> {entry.text}
            </p>
          ))}
          {liveCaption && (
            <p className="italic opacity-90">
              <span className="font-semibold">Joy:</span> {liveCaption}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => (isActive ? stop() : start())}
        className={`w-full rounded-full font-bold py-2.5 transition-colors ${
          isActive
            ? "bg-white text-jb-red-dark hover:bg-neutral-100"
            : "bg-jb-yellow text-jb-red-dark hover:brightness-95"
        }`}
      >
        {isActive ? "End order" : "🎤 Tap to order"}
      </button>
    </div>
  );
}
