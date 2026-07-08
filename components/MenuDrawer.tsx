"use client";

import { CATEGORIES, COMBOS, MENU_ITEMS } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { MenuThumb } from "./MenuThumb";

interface Row {
  id: string;
  name: string;
  price: number;
  image: string;
}

/**
 * Reference-only menu rail: one scrollable list grouped by category, items in
 * the current order highlighted with their qty, running total pinned below.
 * Nothing here is tappable — ordering happens entirely through Joy.
 */
export function MenuDrawer() {
  const { findLineByRef, totals, state } = useCart();

  const groups: Array<{ label: string; rows: Row[] }> = CATEGORIES.map((cat) => ({
    label: cat.labelTl,
    rows:
      cat.id === "combos"
        ? COMBOS.map((c) => ({ id: c.id, name: c.name, price: c.price, image: c.image }))
        : MENU_ITEMS.filter((i) => i.category === cat.id).map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            image: i.image,
          })),
  })).filter((g) => g.rows.length > 0);

  const itemCount = state.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <aside className="bg-background text-foreground border-l border-[#EDE7DD] flex flex-col min-h-0">
      <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="font-bold text-[13.5px]">Menu</h2>
        <span className="text-[10.5px] text-neutral-400">sabihin lang ang pangalan</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-2 min-h-0">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[9.5px] font-semibold uppercase tracking-widest text-neutral-400 px-1.5 pt-2.5 pb-1 sticky top-0 bg-background">
              {group.label}
            </p>
            {group.rows.map((row) => {
              const line = findLineByRef(row.id);
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-2.5 px-1.5 py-1.5 rounded-xl ${
                    line ? "bg-[#FBEAE8] outline outline-[1.5px] outline-jb-red" : ""
                  }`}
                >
                  <MenuThumb
                    src={row.image}
                    alt={row.name}
                    category="combos"
                    className="w-11 h-9 rounded-lg shrink-0"
                  />
                  <span className="flex-1 min-w-0 font-semibold text-[11.5px] leading-tight">
                    {row.name}
                  </span>
                  {line && (
                    <span className="w-[18px] h-[18px] rounded-full bg-jb-red text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                      {line.qty}
                    </span>
                  )}
                  <span className="font-bold text-xs shrink-0">₱{row.price}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-[#E2DACD] mx-3 py-3 flex items-baseline justify-between shrink-0">
        <span className="text-[11px] text-neutral-400">Kabuuan · {itemCount} item</span>
        <span className="font-bold text-lg">₱{totals.total}</span>
      </div>
    </aside>
  );
}
