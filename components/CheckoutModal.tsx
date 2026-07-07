"use client";

import { useEffect, useState } from "react";
import {
  DISCOUNT_LABELS,
  type DiscountType,
  type PaymentMethod,
  useCart,
} from "@/lib/cart";

type Step = "review" | "discount" | "payment" | "confirmation";

const DISCOUNT_OPTIONS: DiscountType[] = ["none", "senior", "pwd", "promo10"];

const PAYMENT_OPTIONS: Array<{ id: NonNullable<PaymentMethod>; label: string; icon: string }> = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "qr", label: "QR (GCash/Maya)", icon: "📱" },
];

export function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { state, totals, setDiscount, setPaymentMethod, confirmOrder, clearCart } = useCart();
  const [step, setStep] = useState<Step>("review");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Voice tool calls (apply_discount, confirm_order) update cart state directly —
  // mirror those into the modal's step so it advances even when the customer
  // never taps a button.
  useEffect(() => {
    if (step === "discount" && state.discountDecided) setStep("payment");
  }, [step, state.discountDecided]);

  useEffect(() => {
    if (state.stage === "confirmed" && step !== "confirmation") {
      setOrderNumber(state.orderNumber);
      setStep("confirmation");
    }
  }, [state.stage, state.orderNumber, step]);

  const handlePlaceOrder = () => {
    const num = confirmOrder();
    setOrderNumber(num);
    setStep("confirmation");
  };

  const handleFinish = () => {
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="bg-jb-red text-white px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">
            {step === "review" && "Review your order"}
            {step === "discount" && "Any discount?"}
            {step === "payment" && "How would you like to pay?"}
            {step === "confirmation" && "Order confirmed!"}
          </h2>
          {step !== "confirmation" && (
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">
              ×
            </button>
          )}
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {step === "review" && (
            <>
              <div className="space-y-2">
                {state.lines.map((line) => (
                  <div key={line.lineId} className="flex justify-between text-sm">
                    <span>
                      {line.qty}× {line.name}
                    </span>
                    <span className="font-semibold">₱{line.unitPrice * line.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-neutral-300 pt-3 flex justify-between font-bold">
                <span>Subtotal</span>
                <span>₱{totals.subtotal}</span>
              </div>
              <button
                onClick={() => setStep("discount")}
                className="w-full rounded-full bg-jb-red text-white font-bold py-3 hover:bg-jb-red-dark"
              >
                Continue
              </button>
            </>
          )}

          {step === "discount" && (
            <>
              <p className="text-sm text-neutral-500">
                Do you have a Senior Citizen / PWD ID or a promo code?
              </p>
              <div className="space-y-2">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDiscount(opt)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      state.discount === opt
                        ? "border-jb-red bg-jb-red/5"
                        : "border-neutral-200 hover:border-jb-red/40"
                    }`}
                  >
                    {DISCOUNT_LABELS[opt]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("payment")}
                className="w-full rounded-full bg-jb-red text-white font-bold py-3 hover:bg-jb-red-dark"
              >
                Continue
              </button>
            </>
          )}

          {step === "payment" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                      state.paymentMethod === opt.id
                        ? "border-jb-red bg-jb-red/5"
                        : "border-neutral-200 hover:border-jb-red/40"
                    }`}
                  >
                    <div className="text-2xl">{opt.icon}</div>
                    <div className="text-xs font-semibold mt-1">{opt.label}</div>
                  </button>
                ))}
              </div>

              {state.paymentMethod === "qr" && (
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-36 h-36 rounded-lg bg-[repeating-conic-gradient(#241412_0_25%,white_0_50%)] bg-[length:12px_12px] border-4 border-neutral-200" />
                  <p className="text-xs text-neutral-500">Scan to pay · demo QR</p>
                </div>
              )}
              {state.paymentMethod === "card" && (
                <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-400">
                  Card terminal simulation — demo only
                </div>
              )}

              <div className="border-t border-dashed border-neutral-300 pt-3 flex justify-between font-bold">
                <span>Total due</span>
                <span>₱{totals.total}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!state.paymentMethod}
                className="w-full rounded-full bg-jb-red text-white font-bold py-3 disabled:opacity-40 hover:bg-jb-red-dark"
              >
                Place order
              </button>
            </>
          )}

          {step === "confirmation" && (
            <div className="text-center space-y-3 py-4">
              <div className="text-5xl">✅</div>
              <p className="font-bold text-xl">Order #{orderNumber}</p>
              <p className="text-sm text-neutral-500">
                Thank you! Please proceed to the counter to pick up your order.
              </p>
              <div className="text-left border-t border-dashed border-neutral-300 pt-3 space-y-1">
                {state.lines.map((line) => (
                  <div key={line.lineId} className="flex justify-between text-sm">
                    <span>
                      {line.qty}× {line.name}
                    </span>
                    <span>₱{line.unitPrice * line.qty}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2">
                  <span>Total paid</span>
                  <span>₱{totals.total}</span>
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="w-full rounded-full bg-jb-red text-white font-bold py-3 hover:bg-jb-red-dark mt-2"
              >
                Start a new order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
