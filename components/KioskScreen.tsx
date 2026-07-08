"use client";

import { useEffect, useState } from "react";
import { CategoryRail } from "./CategoryRail";
import { MenuTiles } from "./MenuTiles";
import { CheckoutModal } from "./CheckoutModal";
import { VoiceDock } from "./VoiceDock";
import { VoiceSheet } from "./VoiceSheet";
import { useCart } from "@/lib/cart";
import { useRealtimeVoice } from "@/lib/voice/useRealtimeVoice";
import type { CategoryId } from "@/lib/menu";
import type { UpsellSuggestion } from "@/lib/voice/tools";

/** Sample content for `?preview=voice` — lets anyone tweak the speaking-state UI without a mic. */
const PREVIEW_SUGGESTION: UpsellSuggestion[] = [
  { refId: "addon-peach-mango-pie", kind: "addon", name: "Peach-Mango Pie", price: 45, image: "/menu/peach-mango-pie.png" },
];

export function KioskScreen() {
  const cart = useCart();
  const [category, setCategory] = useState<CategoryId>("combos");
  const [preview, setPreview] = useState(false);

  const voice = useRealtimeVoice({ openCheckout: () => cart.setStage("checkout") });

  // Stage is the single source of truth: the modal is open for checkout AND
  // the confirmation screen, closed only while ordering.
  const checkoutOpen = cart.state.stage !== "ordering";

  useEffect(() => {
    // One-time post-mount read; window isn't available during SSR, so this
    // can't be a useState initializer without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(new URLSearchParams(window.location.search).get("preview") === "voice");
  }, []);

  const caption = preview
    ? "Added! Gusto niyo rin po ng Peach-Mango Pie, ₱45 lang?"
    : voice.liveCaption;
  const suggestions = preview ? PREVIEW_SUGGESTION : voice.suggestions;
  const lastUserText = preview ? "Isang Chickenjoy Combo please" : voice.lastUserText;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <header className="relative z-40 h-[54px] bg-k-card border-b border-k-line flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-[9px] bg-jb-red flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <circle cx="12" cy="12" r="5.2" />
              <circle cx="12" cy="3.6" r="1.9" />
              <circle cx="12" cy="20.4" r="1.9" />
              <circle cx="3.6" cy="12" r="1.9" />
              <circle cx="20.4" cy="12" r="1.9" />
            </svg>
          </span>
          <b className="font-display font-bold text-[14.5px] tracking-tight">Jollibee</b>
        </div>
        <span className="font-mono text-[10.5px] tracking-widest text-k-dim uppercase">
          TL / EN · Voice
        </span>
      </header>

      <main className="flex-1 grid grid-cols-[88px_minmax(0,1fr)] min-h-0">
        <CategoryRail active={category} onChange={setCategory} />
        <section className="overflow-y-auto">
          <MenuTiles category={category} />
        </section>
      </main>

      <VoiceSheet
        speaking={preview ? true : voice.status === "speaking"}
        caption={caption}
        lastUserText={lastUserText}
        suggestions={suggestions}
      />

      <VoiceDock
        status={preview ? "speaking" : voice.status}
        errorMessage={voice.errorMessage}
        onStart={voice.start}
        onStop={voice.stop}
      />

      {checkoutOpen && <CheckoutModal />}
    </div>
  );
}
