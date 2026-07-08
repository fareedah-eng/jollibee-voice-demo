"use client";

import { useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { MenuGrid } from "./MenuGrid";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";
import { VoicePanel } from "./VoicePanel";
import { useCart } from "@/lib/cart";
import type { CategoryId } from "@/lib/menu";

export function KioskScreen() {
  const cart = useCart();
  const [category, setCategory] = useState<CategoryId>("combos");

  // Stage is the single source of truth: the modal is open for checkout AND
  // the confirmation screen, closed only while ordering — so Joy's tool calls
  // (start_checkout / resume_ordering / clear_cart) fully control it.
  const checkoutOpen = cart.state.stage !== "ordering";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-jb-red text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
            🐝
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">Jollibee</h1>
            <p className="text-xs text-white/80 leading-tight">
              AI Voice Ordering · Tagalog / English
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="p-4 sm:p-6 space-y-4">
          <div>
            <CategoryTabs active={category} onChange={setCategory} />
            <p className="text-xs text-neutral-400 mt-2">
              Tingnan ang menu dito — lahat ng order, sabihin lang kay Joy sa kanan.
            </p>
          </div>
          <MenuGrid category={category} />
        </section>

        <aside className="border-t lg:border-t-0 lg:border-l border-neutral-200 bg-white lg:sticky lg:top-0 lg:h-screen flex flex-col">
          <VoicePanel onOpenCheckout={() => cart.setStage("checkout")} />
          <div className="flex-1 min-h-0">
            <CartDrawer />
          </div>
        </aside>
      </main>

      {checkoutOpen && <CheckoutModal />}
    </div>
  );
}
