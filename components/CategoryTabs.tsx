"use client";

import { CATEGORIES, type CategoryId } from "@/lib/menu";

export function CategoryTabs({
  active,
  onChange,
}: {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap border ${
              isActive
                ? "bg-jb-red text-white border-jb-red shadow-sm"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-jb-red/40"
            }`}
          >
            {cat.labelTl}
          </button>
        );
      })}
    </div>
  );
}
