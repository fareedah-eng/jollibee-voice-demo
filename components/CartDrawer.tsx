"use client";

import { useCart } from "@/lib/cart";

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const { state, totals, removeLine, updateQty } = useCart();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h2 className="font-bold text-lg">Your Order</h2>
        <span className="text-sm text-neutral-500">
          {state.lines.reduce((n, l) => n + l.qty, 0)} item(s)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {state.lines.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-10">
            Your cart is empty. Tap &ldquo;Tap to order&rdquo; above and tell Joy what you&apos;d like!
          </p>
        ) : (
          state.lines.map((line) => (
            <div key={line.lineId} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{line.name}</p>
                <p className="text-xs text-neutral-500">₱{line.unitPrice} each</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQty(line.lineId, line.qty - 1)}
                    className="w-6 h-6 rounded-full border border-neutral-300 text-sm font-bold hover:bg-neutral-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm w-4 text-center">{line.qty}</span>
                  <button
                    onClick={() => updateQty(line.lineId, line.qty + 1)}
                    className="w-6 h-6 rounded-full border border-neutral-300 text-sm font-bold hover:bg-neutral-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">₱{line.unitPrice * line.qty}</p>
                <button
                  onClick={() => removeLine(line.lineId)}
                  className="text-xs text-neutral-400 hover:text-jb-red mt-1"
                >
                  Remove
                </button>
              </div>
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
          <span>Total</span>
          <span>₱{totals.total}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={state.lines.length === 0}
          className="w-full mt-2 rounded-full bg-jb-red text-white font-bold py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-jb-red-dark transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
