"use client";

import { CATEGORIES, COMBOS, MENU_ITEMS, type CategoryId } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { MenuThumb } from "./MenuThumb";

interface Tile {
  id: string;
  name: string;
  price: number;
  image: string;
  category: CategoryId;
  tags?: string[];
}

const TAG_LABELS: Record<string, string> = {
  bestseller: "Bestseller",
  new: "Bago",
  spicy: "Spicy",
};

export function MenuTiles({ category }: { category: CategoryId }) {
  const { findLineByRef } = useCart();

  const tiles: Tile[] =
    category === "combos"
      ? COMBOS.map((c) => ({ id: c.id, name: c.name, price: c.price, image: c.image, category, tags: c.tags }))
      : MENU_ITEMS.filter((i) => i.category === category).map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          image: i.image,
          category,
          tags: i.tags,
        }));

  const heading = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display font-bold text-xl tracking-tight">
          {heading?.labelTl ?? heading?.label}
        </h2>
        <span className="font-mono text-[10px] tracking-widest text-k-dim uppercase">
          {tiles.length} items
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tiles.map((tile) => {
          const line = findLineByRef(tile.id);
          return (
            <div
              key={tile.id}
              className={`relative bg-k-card rounded-2xl p-3.5 shadow-[0_1px_2px_rgba(29,27,26,0.05),0_12px_28px_-18px_rgba(29,27,26,0.18)] ${
                line ? "outline-2 outline-jb-red -outline-offset-2" : ""
              }`}
            >
              <MenuThumb
                src={tile.image}
                alt={tile.name}
                category={tile.category}
                className="w-full h-24 rounded-xl"
              />
              {tile.tags?.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="absolute top-5 left-5 bg-jb-yellow text-[#5F4200] text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                >
                  {TAG_LABELS[tag] ?? tag}
                </span>
              ))}
              {line && (
                <span className="absolute top-5 right-5 w-[22px] h-[22px] rounded-full bg-jb-red text-white text-[11px] font-semibold flex items-center justify-center">
                  {line.qty}
                </span>
              )}
              <div className="font-semibold text-[13.5px] leading-tight tracking-tight mt-2.5">
                {tile.name}
              </div>
              <div className="font-display font-bold text-base tracking-tight mt-1">
                <sup className="text-[10px] font-semibold text-k-dim mr-px">₱</sup>
                {tile.price}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
