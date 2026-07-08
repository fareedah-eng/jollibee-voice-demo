"use client";

import { useRealtimeVoice } from "@/lib/voice/useRealtimeVoice";

const STATUS_LABEL: Record<string, string> = {
  idle: "I-tap para magsimula",
  connecting: "Kumokonekta…",
  listening: "Nakikinig…",
  speaking: "Nagsasalita…",
};

export function VoicePanel({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { status, transcript, liveCaption, errorMessage, start, stop } = useRealtimeVoice({
    openCheckout: onOpenCheckout,
  });

  const isActive = status === "connecting" || status === "listening" || status === "speaking";
  const lastUser = [...transcript].reverse().find((entry) => entry.role === "user");
  const lastJoy = [...transcript].reverse().find((entry) => entry.role === "assistant");
  // Joy's live words dominate; fall back to her last full line while listening.
  const headline = liveCaption || lastJoy?.text || "";

  return (
    <div className="border-b border-neutral-200 bg-gradient-to-b from-jb-red to-jb-red-dark text-white px-5 pt-6 pb-5 flex flex-col items-center text-center gap-3">
      {/* The orb IS the interface — big, centered, animated */}
      <button
        onClick={() => (isActive ? stop() : start())}
        aria-label={isActive ? "Tapusin ang order" : "Simulan ang pag-order gamit ang boses"}
        className="relative w-24 h-24 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
      >
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            isActive
              ? "bg-[radial-gradient(circle_at_35%_30%,#FFD34D,#FFC72C_70%)]"
              : "bg-white/15 border-2 border-white/40"
          }`}
        />
        {status === "listening" && (
          <span className="absolute -inset-2 rounded-full border-2 border-jb-yellow/70 animate-pulse" />
        )}
        {status === "speaking" && (
          <span className="absolute -inset-2 rounded-full border-2 border-white animate-ping" />
        )}
        <span className="absolute inset-0 flex items-center justify-center text-4xl">
          🎙️
        </span>
      </button>

      <div>
        <p className="font-extrabold text-xl leading-tight">Joy</p>
        <p className="text-sm text-white/85">
          {status === "error" ? errorMessage || "Nagka-problema — subukan ulit" : STATUS_LABEL[status]}
        </p>
      </div>

      {/* Live words — the loudest text on screen while Joy talks */}
      {isActive && headline && (
        <p className="font-bold text-lg leading-snug text-balance min-h-[3.5rem]">
          &ldquo;{headline}&rdquo;
        </p>
      )}
      {isActive && lastUser && (
        <p className="text-xs text-white/70 -mt-1">
          Sinabi niyo — &ldquo;{lastUser.text}&rdquo;
        </p>
      )}

      {!isActive && (
        <p className="text-sm text-white/85 max-w-[26ch]">
          Sabihin lang ang gusto niyo — hal.{" "}
          <b className="text-jb-yellow">&ldquo;Isang Chickenjoy Combo po&rdquo;</b>
        </p>
      )}

      <button
        onClick={() => (isActive ? stop() : start())}
        className={`w-full rounded-full font-bold py-3 transition-colors ${
          isActive
            ? "bg-white/15 border border-white/40 text-white hover:bg-white/25"
            : "bg-jb-yellow text-jb-red-dark hover:brightness-95"
        }`}
      >
        {isActive ? "Tapusin ang order" : "🎤 Mag-order gamit ang boses"}
      </button>
    </div>
  );
}
