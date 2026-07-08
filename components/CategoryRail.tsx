"use client";

import { CATEGORIES, type CategoryId } from "@/lib/menu";

const CATEGORY_ICONS: Record<CategoryId, string> = {
  combos: "🍽️",
  chicken: "🍗",
  burgers: "🍔",
  "spaghetti-palabok": "🍝",
  ricemeals: "🍚",
  sandwiches: "🥪",
  sides: "🍟",
  desserts: "🍦",
  beverages: "🥤",
  kids: "🧸",
};

const RAIL_LABELS: Record<CategoryId, string> = {
  combos: "Combos",
  chicken: "Manok",
  burgers: "Burgers",
  "spaghetti-palabok": "Pasta",
  ricemeals: "Rice",
  sandwiches: "Sandwich",
  sides: "Sides",
  desserts: "Dessert",
  beverages: "Inumin",
  kids: "Kids",
};

export function CategoryRail({
  active,
  onChange,
}: {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}) {
  return (
    <nav className="bg-k-card border-r border-k-line px-2.5 py-3.5 flex flex-col gap-1.5 overflow-y-auto">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`rounded-xl px-1 pt-2 pb-1.5 text-center transition-colors ${
              isActive ? "bg-[#FBEAE8]" : "hover:bg-neutral-50"
            }`}
          >
            <div className="text-[19px] leading-none">{CATEGORY_ICONS[cat.id]}</div>
            <div
              className={`text-[8.5px] font-semibold uppercase tracking-wide mt-1 ${
                isActive ? "text-jb-red" : "text-k-dim"
              }`}
            >
              {RAIL_LABELS[cat.id]}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
