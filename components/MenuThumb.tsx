"use client";

import { useState } from "react";
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

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-4xl ${className}`}
        aria-label={alt}
      >
        {CATEGORY_EMOJI[category]}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      // An SSR'd <img> can 404 before hydration attaches onError, so also
      // check on ref attach whether the load already failed silently.
      ref={(el) => {
        if (el && el.complete && el.naturalWidth === 0) setErrored(true);
      }}
      onError={() => setErrored(true)}
    />
  );
}
