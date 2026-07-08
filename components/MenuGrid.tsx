"use client";

import { COMBOS, MENU_ITEMS, type CategoryId } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { MenuThumb } from "./MenuThumb";

const TAG_STYLES: Record<string, string> = {
  bestseller: "bg-jb-yellow text-jb-red-dark",
  new: "bg-jb-orange text-white",
  spicy: "bg-red-700 text-white",
};

function InCartBadge({ qty }: { qty: number | undefined }) {
  if (!qty) return null;
  return (
    <span className="rounded-full bg-jb-red/10 text-jb-red-dark text-xs font-bold px-2.5 py-1">
      ✓ {qty} sa order
    </span>
  );
}

export function MenuGrid({ category }: { category: CategoryId }) {
  const { findLineByRef } = useCart();

  if (category === "combos") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {COMBOS.map((combo) => {
          const line = findLineByRef(combo.id);
          return (
            <div
              key={combo.id}
              className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col shadow-sm"
            >
              <div className="relative h-36">
                <MenuThumb
                  src={combo.image}
                  alt={combo.name}
                  category="combos"
                  className="w-full h-full"
                />
                {combo.tags?.map((tag) => (
                  <span
                    key={tag}
                    className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${TAG_STYLES[tag]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <h3 className="font-bold text-sm leading-snug">{combo.name}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2 flex-1">
                  {combo.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-jb-red-dark">₱{combo.price}</span>
                  <InCartBadge qty={line?.qty} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const items = MENU_ITEMS.filter((item) => item.category === category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => {
        const line = findLineByRef(item.id);
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col shadow-sm"
          >
            <div className="relative h-36">
              <MenuThumb
                src={item.image}
                alt={item.name}
                category={item.category}
                className="w-full h-full"
              />
              {item.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${TAG_STYLES[tag]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="p-3 flex flex-col gap-1 flex-1">
              <h3 className="font-bold text-sm leading-snug">{item.name}</h3>
              <p className="text-xs text-neutral-500 line-clamp-2 flex-1">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-jb-red-dark">₱{item.price}</span>
                <InCartBadge qty={line?.qty} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
