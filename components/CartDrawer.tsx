"use client";

import { useCart } from "@/lib/cart";

/**
 * Read-only reflection of the cart — add/remove/qty and checkout all happen
 * through Joy (voice tool calls), not taps here.
 */
export function CartDrawer() {
  const { state, totals } = useCart();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h2 className="font-bold text-lg">Ang Order Niyo</h2>
        <span className="text-sm text-neutral-500">
          {state.lines.reduce((n, l) => n + l.qty, 0)} item
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {state.lines.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-10">
            Wala pa kayong order. I-tap si Joy sa taas at sabihin ang gusto niyo!
          </p>
        ) : (
          state.lines.map((line) => (
            <div key={line.lineId} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{line.name}</p>
                <p className="text-xs text-neutral-500">
                  {line.qty} × ₱{line.unitPrice}
                </p>
              </div>
              <p className="text-sm font-bold shrink-0">₱{line.unitPrice * line.qty}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-neutral-200 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span>₱{totals.subtotal}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-jb-red-dark">
            <span>Discount</span>
            <span>−₱{totals.discountAmount}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-1">
          <span>Kabuuan</span>
          <span>₱{totals.total}</span>
        </div>
        {state.lines.length > 0 && (
          <p className="text-xs text-neutral-400 text-center pt-2">
            Sabihin lang kay Joy kapag handa na kayong mag-checkout.
          </p>
        )}
      </div>
    </div>
  );
}
