"use client";

import { useCart } from "@/lib/cart";
import type { VoiceStatus } from "@/lib/voice/useRealtimeVoice";

function Orb({ active }: { active: boolean }) {
  return (
    <span className="relative w-10 h-10 shrink-0 rounded-full">
      <span
        className={`absolute inset-0 rounded-full ${
          active
            ? "bg-[radial-gradient(circle_at_35%_30%,#FF7A66,#DA291C_72%)]"
            : "bg-[radial-gradient(circle_at_35%_30%,#B9B4AE,#8A8580_72%)]"
        }`}
      />
      <span
        className={`absolute -inset-[5px] rounded-full border ${
          active ? "border-jb-red/35 animate-pulse" : "border-neutral-400/30"
        }`}
      />
    </span>
  );
}

export function VoiceDock({
  status,
  errorMessage,
  onStart,
  onStop,
}: {
  status: VoiceStatus;
  errorMessage: string | null;
  onStart: () => void;
  onStop: () => void;
}) {
  const { state, totals } = useCart();
  const itemCount = state.lines.reduce((n, l) => n + l.qty, 0);
  const active = status === "listening" || status === "speaking" || status === "connecting";

  return (
    <div className="relative z-40 h-[74px] bg-k-card border-t border-k-line flex items-center gap-4 px-5 shrink-0">
      <button
        onClick={active ? onStop : onStart}
        aria-label={active ? "Tapusin ang order" : "Simulan ang pag-order"}
        className="flex items-center gap-4 flex-1 min-w-0 text-left"
      >
        <Orb active={active} />
        <span className="flex-1 min-w-0">
          {status === "idle" && (
            <>
              <span className="block text-[11px] text-k-dim">I-tap para magsimula —</span>
              <span className="block font-display font-bold text-[16.5px] tracking-tight truncate">
                kausapin si <em className="not-italic text-jb-red">Joy</em> para mag-order
              </span>
            </>
          )}
          {status === "connecting" && (
            <span className="block font-display font-bold text-[16.5px] tracking-tight">
              Kumokonekta&hellip;
            </span>
          )}
          {status === "listening" && (
            <>
              <span className="block text-[11px] text-k-dim">Nakikinig&hellip;</span>
              <span className="block font-display font-bold text-[16.5px] tracking-tight truncate">
                Sabihin lang, hal. <em className="not-italic text-jb-red">&ldquo;Isang Chickenjoy Combo&rdquo;</em>
              </span>
            </>
          )}
          {status === "speaking" && (
            <>
              <span className="block text-[11px] text-k-dim">Nagsasalita si Joy&hellip;</span>
              <span className="block font-display font-bold text-[16.5px] tracking-tight truncate text-k-dim">
                Maaari niyo siyang sabayan anumang oras
              </span>
            </>
          )}
          {status === "error" && (
            <span className="block font-semibold text-[13px] text-jb-red truncate">
              {errorMessage || "Nagka-problema — i-tap para subukan ulit"}
            </span>
          )}
        </span>
      </button>

      {active && (
        <button
          onClick={onStop}
          className="text-[11px] font-semibold text-k-dim hover:text-jb-red shrink-0"
        >
          Tapusin
        </button>
      )}

      <span className="bg-[#F3F1ED] rounded-full px-3.5 py-1.5 text-xs font-semibold shrink-0">
        Order · {itemCount}
      </span>
      <span className="text-right shrink-0">
        <span className="block font-mono text-[9.5px] tracking-widest text-k-dim uppercase">
          Kabuuan
        </span>
        <span className="block font-display font-bold text-[21px] tracking-tight leading-none">
          <sup className="text-[11px] text-k-dim font-semibold mr-px">₱</sup>
          {totals.total}
        </span>
      </span>
    </div>
  );
}
