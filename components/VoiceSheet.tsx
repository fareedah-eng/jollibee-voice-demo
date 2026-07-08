"use client";

import type { UpsellSuggestion } from "@/lib/voice/tools";
import { MenuThumb } from "./MenuThumb";

/**
 * The "Joy is speaking" overlay — her words become the headline, and if she's
 * offering an upsell, the exact item shows as a card so the customer sees
 * what saying "sige" adds. Purely a read-out; no clickable controls.
 */
export function VoiceSheet({
  speaking,
  caption,
  lastUserText,
  suggestions,
}: {
  speaking: boolean;
  caption: string;
  lastUserText: string;
  suggestions: UpsellSuggestion[];
}) {
  if (!caption) return null;

  const suggestion = suggestions[0];

  return (
    <>
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[3px] z-30" />
      <div className="absolute left-1/2 bottom-24 -translate-x-1/2 z-40 w-[min(560px,calc(100%-40px))] bg-k-card rounded-3xl px-6 py-5 shadow-[0_30px_70px_-25px_rgba(29,27,26,0.35),0_2px_6px_rgba(29,27,26,0.06)]">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="relative w-8 h-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FF7A66,#DA291C_72%)]">
            <span className="absolute -inset-1 rounded-full border border-jb-red/35" />
          </span>
          <span>
            <span className="block font-display font-bold text-[13px] leading-tight">Joy</span>
            <span className="block font-mono text-[9.5px] tracking-widest uppercase text-jb-red leading-tight">
              {speaking ? "● Nagsasalita" : "Nakikinig"}
            </span>
          </span>
        </div>

        <p className="font-display font-bold text-[21px] leading-[1.3] tracking-tight m-0">
          {caption}
        </p>

        {suggestion && (
          <div className="flex items-center gap-3 mt-4 p-3 bg-[#FDF8EE] border border-[#F3E3C2] rounded-2xl">
            {suggestion.image ? (
              <MenuThumb
                src={suggestion.image}
                alt={suggestion.name}
                category="sides"
                className="w-[52px] h-[52px] rounded-xl shrink-0"
              />
            ) : (
              <span className="w-[52px] h-[52px] rounded-xl bg-jb-yellow/30 flex items-center justify-center text-2xl shrink-0">
                🍽️
              </span>
            )}
            <span className="min-w-0">
              <span className="block font-semibold text-[13px] truncate">{suggestion.name}</span>
              <span className="block font-display font-bold text-[13.5px]">₱{suggestion.price}</span>
            </span>
            <span className="ml-auto text-right shrink-0">
              <span className="block font-mono text-[10px] text-k-dim leading-relaxed">
                sabihin lang
              </span>
              <span className="block font-semibold text-[11.5px] text-jb-red">
                &ldquo;sige&rdquo; o &ldquo;oo&rdquo;
              </span>
            </span>
          </div>
        )}

        {lastUserText && (
          <p className="text-[12.5px] text-k-dim mt-3 mb-0">
            Sinabi niyo — <b className="text-foreground font-semibold">&ldquo;{lastUserText}&rdquo;</b>
          </p>
        )}
      </div>
    </>
  );
}
