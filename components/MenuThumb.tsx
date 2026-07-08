"use client";

import { useEffect, useState } from "react";
import type { CategoryId } from "@/lib/menu";

const CATEGORY_EMOJI: Record<CategoryId, string> = {
  combos: "🍽️",
  chicken: "🍗",
  burgers: "🍔",
  "spaghetti-palabok": "🍝",
  ricemeals: "🍚",
  sandwiches: "🥪",
  sides: "🍟",
  desserts: "🥧",
  beverages: "🥤",
  kids: "🧒",
};

export function MenuThumb({
  src,
  alt,
  category,
  className = "",
}: {
  src: string;
  alt: string;
  category: CategoryId;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  // Deferred until after mount: an <img src> present in the initial SSR HTML
  // starts fetching before React hydrates, so a fast local 404 fires onError
  // before the listener is attached and the fallback never shows. Mounting
  // the real <img> only on the client guarantees onError is always caught.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (errored || !mounted) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-4xl ${className}`}
        aria-label={alt}
      >
        {CATEGORY_EMOJI[category]}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
