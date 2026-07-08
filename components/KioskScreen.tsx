"use client";

import { useEffect, useState } from "react";
import { ActionFeed } from "./ActionFeed";
import { MenuDrawer } from "./MenuDrawer";
import { CheckoutModal } from "./CheckoutModal";
import { useCart } from "@/lib/cart";
import { useRealtimeVoice, type ActionCard } from "@/lib/voice/useRealtimeVoice";
import type { UpsellSuggestion } from "@/lib/voice/tools";

const STATUS_LABEL: Record<string, string> = {
  connecting: "Kumokonekta…",
  listening: "Nakikinig…",
  speaking: "Nagsasalita…",
};

/** Sample content for `?preview=voice` — tweak the stage UI without a mic. */
const PREVIEW_ACTIONS: ActionCard[] = [
  {
    id: 1,
    kind: "bestsellers",
    title: "Mga bestseller ngayon",
    items: [
      { name: "1-pc Chickenjoy Combo", price: 179, image: "/menu/combo-chickenjoy-1pc.png" },
      { name: "Cheesy Yumburger Combo", price: 129, image: "/menu/combo-cheesy-yumburger.png" },
      { name: "Peach-Mango Pie", price: 45, image: "/menu/peach-mango-pie.png" },
    ],
  },
  { id: 2, kind: "added", title: "1-pc Chickenjoy Combo", qty: 1, price: 179, image: "/menu/combo-chickenjoy-1pc.png", total: 179 },
];
const PREVIEW_SUGGESTION: UpsellSuggestion = {
  refId: "addon-peach-mango-pie",
  kind: "addon",
  name: "Peach-Mango Pie",
  price: 45,
  image: "/menu/peach-mango-pie.png",
};

export function KioskScreen() {
  const cart = useCart();
  const [preview, setPreview] = useState(false);

  const voice = useRealtimeVoice({ openCheckout: () => cart.setStage("checkout") });

  // Stage is the single source of truth: the modal is open for checkout AND
  // the confirmation screen, closed only while ordering — so Joy's tool calls
  // (start_checkout / resume_ordering / clear_cart) fully control it.
  const checkoutOpen = cart.state.stage !== "ordering";

  useEffect(() => {
    // One-time post-mount read; window isn't available during SSR, so this
    // can't be a useState initializer without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(new URLSearchParams(window.location.search).get("preview") === "voice");
  }, []);

  const status = preview ? "listening" : voice.status;
  const actions = preview ? PREVIEW_ACTIONS : voice.actions;
  const suggestion = preview ? PREVIEW_SUGGESTION : voice.suggestions[0];
  const isActive = status === "connecting" || status === "listening" || status === "speaking";

  return (
    <div className="h-screen flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] overflow-hidden">
      {/* ================= voice stage ================= */}
      <section className="relative flex-1 lg:flex-none bg-gradient-to-br from-jb-red to-jb-red-dark text-white flex flex-col min-h-0">
        <header className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg">
              🐝
            </span>
            <b className="font-extrabold text-[15px]">Jollibee</b>
          </div>
          {isActive && (
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/75">
              ● {STATUS_LABEL[status]}
            </span>
          )}
        </header>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 px-6 pb-6 overflow-y-auto">
          {/* orb — tap to start/stop */}
          <button
            onClick={() => (isActive ? voice.stop() : voice.start())}
            aria-label={isActive ? "Tapusin ang order" : "Simulan ang pag-order gamit ang boses"}
            className={`relative rounded-full shrink-0 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${
              isActive ? "w-16 h-16" : "w-28 h-28"
            }`}
          >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFD34D,#FFC72C_70%)]" />
            {status === "listening" && (
              <span className="absolute -inset-2 rounded-full border-2 border-jb-yellow/70 animate-pulse" />
            )}
            {status === "speaking" && (
              <span className="absolute -inset-2 rounded-full border-2 border-white animate-ping" />
            )}
            <span
              className={`absolute inset-0 flex items-center justify-center ${
                isActive ? "text-2xl" : "text-5xl"
              }`}
            >
              🎙️
            </span>
          </button>

          {!isActive ? (
            <>
              <div className="text-center">
                <p className="font-extrabold text-2xl">Kausapin si Joy</p>
                <p className="text-sm text-white/85 mt-1">
                  {status === "error"
                    ? voice.errorMessage || "Nagka-problema — subukan ulit"
                    : "I-tap ang mic para magsimula"}
                </p>
              </div>
              <p className="text-sm text-white/80 text-center max-w-[30ch]">
                Sabihin lang ang gusto niyo — hal.{" "}
                <b className="text-jb-yellow">&ldquo;Isang Chickenjoy Combo po&rdquo;</b>
              </p>
            </>
          ) : (
            <ActionFeed actions={actions} suggestion={suggestion} />
          )}
        </div>

        {isActive && (
          <footer className="flex items-center justify-between px-5 py-3.5 shrink-0 text-white/75">
            <span className="text-xs">Sabihin lang — nakikinig si Joy</span>
            <button
              onClick={voice.stop}
              className="text-xs font-semibold hover:text-white border border-white/30 rounded-full px-3.5 py-1.5"
            >
              Tapusin
            </button>
          </footer>
        )}
      </section>

      {/* ================= menu drawer ================= */}
      <MenuDrawer />

      {checkoutOpen && <CheckoutModal />}
    </div>
  );
}
