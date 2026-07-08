"use client";

import type { ActionCard } from "@/lib/voice/useRealtimeVoice";
import type { UpsellSuggestion } from "@/lib/voice/tools";
import { MenuThumb } from "./MenuThumb";

const KIND_BADGE: Record<Exclude<ActionCard["kind"], "bestsellers">, string> = {
  added: "✓ Idinagdag",
  removed: "✕ Inalis",
  qty: "✎ Binago",
  discount: "✓ Discount",
  payment: "✓ Bayad",
  confirmed: "✓ Kumpirmado",
};

/**
 * The facts of the conversation — no transcripts. Joy's voice carries the
 * personality; these cards carry only what happened and what it costs.
 */
export function ActionFeed({
  actions,
  suggestion,
}: {
  actions: ActionCard[];
  suggestion: UpsellSuggestion | undefined;
}) {
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {actions.map((card, index) => {
        const isLatest = index === actions.length - 1 && !suggestion;

        if (card.kind === "bestsellers") {
          return (
            <div
              key={card.id}
              className={`bg-white/10 border border-white/25 rounded-2xl p-3.5 transition-opacity ${
                isLatest ? "" : "opacity-70"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-jb-yellow mb-2.5">
                {card.title}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {card.items?.map((item) => (
                  <div key={item.name} className="bg-white/10 border border-white/20 rounded-xl p-2">
                    {item.image && (
                      <MenuThumb
                        src={item.image}
                        alt={item.name}
                        category="combos"
                        className="w-full h-14 rounded-lg"
                      />
                    )}
                    <p className="text-[10.5px] font-semibold leading-tight mt-1.5">{item.name}</p>
                    <p className="text-[11.5px] font-bold text-jb-yellow">₱{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className={`bg-white text-foreground rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] transition-opacity ${
              isLatest ? "" : "opacity-65"
            }`}
          >
            {card.image ? (
              <MenuThumb
                src={card.image}
                alt={card.title}
                category="combos"
                className="w-12 h-12 rounded-xl shrink-0"
              />
            ) : (
              <span className="w-12 h-12 rounded-xl bg-jb-red/10 text-jb-red flex items-center justify-center text-xl shrink-0">
                {card.kind === "confirmed" ? "✅" : card.kind === "removed" ? "✕" : "✓"}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-jb-red">
                {KIND_BADGE[card.kind]}
              </span>
              <span className="block font-bold text-sm leading-tight truncate">
                {card.qty && card.qty > 1 ? `${card.qty}× ` : ""}
                {card.title}
              </span>
            </span>
            <span className="text-right shrink-0">
              {card.price !== undefined && (
                <span className="block font-bold text-sm">₱{card.price}</span>
              )}
              {card.total !== undefined && (
                <span className="block text-[10.5px] text-neutral-400">
                  Kabuuan ₱{card.total}
                </span>
              )}
            </span>
          </div>
        );
      })}

      {suggestion && (
        <div className="bg-[#FDF8EE] text-foreground border border-[#F3E3C2] rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)]">
          {suggestion.image ? (
            <MenuThumb
              src={suggestion.image}
              alt={suggestion.name}
              category="desserts"
              className="w-12 h-12 rounded-xl shrink-0"
            />
          ) : (
            <span className="w-12 h-12 rounded-xl bg-jb-yellow/30 flex items-center justify-center text-xl shrink-0">
              🍽️
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-sm leading-tight truncate">{suggestion.name}</span>
            <span className="block font-bold text-[13px] text-jb-red-dark">₱{suggestion.price}</span>
          </span>
          <span className="text-right shrink-0 leading-tight">
            <span className="block text-[10px] text-neutral-400">sabihin lang</span>
            <span className="block font-semibold text-[11.5px] text-jb-red">
              &ldquo;sige&rdquo; o &ldquo;oo&rdquo;
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
