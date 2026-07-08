"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { findAddon, findCombo, findMenuItem } from "./menu";

export type DiscountType = "none" | "senior" | "pwd" | "promo10";
export type PaymentMethod = "cash" | "card" | "qr" | null;
export type OrderStage = "ordering" | "checkout" | "confirmed";

export interface CartLine {
  lineId: string;
  kind: "item" | "combo" | "addon";
  refId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  discount: DiscountType;
  /** Whether the customer has explicitly answered the discount question (distinguishes "no discount" from "not asked yet"). */
  discountDecided: boolean;
  paymentMethod: PaymentMethod;
  stage: OrderStage;
  orderNumber: string | null;
}

type CartAction =
  | { type: "ADD_LINE"; kind: CartLine["kind"]; refId: string; qty: number }
  | { type: "REMOVE_LINE"; lineId: string }
  | { type: "UPDATE_QTY"; lineId: string; qty: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_DISCOUNT"; discount: DiscountType }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_STAGE"; stage: OrderStage }
  | { type: "CONFIRM_ORDER"; orderNumber: string };

const initialState: CartState = {
  lines: [],
  discount: "none",
  discountDecided: false,
  paymentMethod: null,
  stage: "ordering",
  orderNumber: null,
};

function resolveLine(kind: CartLine["kind"], refId: string) {
  if (kind === "item") {
    const item = findMenuItem(refId);
    if (!item) return null;
    return { name: item.name, unitPrice: item.price };
  }
  if (kind === "combo") {
    const combo = findCombo(refId);
    if (!combo) return null;
    return { name: combo.name, unitPrice: combo.price };
  }
  const addon = findAddon(refId);
  if (!addon) return null;
  return { name: addon.name, unitPrice: addon.price };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_LINE": {
      const resolved = resolveLine(action.kind, action.refId);
      if (!resolved) return state;

      const existing = state.lines.find(
        (line) => line.kind === action.kind && line.refId === action.refId
      );
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.lineId === existing.lineId
              ? { ...line, qty: line.qty + action.qty }
              : line
          ),
        };
      }

      const newLine: CartLine = {
        lineId: `${action.kind}-${action.refId}-${state.lines.length}-${Date.now() % 100000}`,
        kind: action.kind,
        refId: action.refId,
        name: resolved.name,
        unitPrice: resolved.unitPrice,
        qty: action.qty,
      };
      return { ...state, lines: [...state.lines, newLine] };
    }
    case "REMOVE_LINE":
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, qty: action.qty } : l
        ),
      };
    }
    case "CLEAR_CART":
      return { ...initialState };
    case "SET_DISCOUNT":
      return { ...state, discount: action.discount, discountDecided: true };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_STAGE":
      return { ...state, stage: action.stage };
    case "CONFIRM_ORDER":
      return { ...state, stage: "confirmed", orderNumber: action.orderNumber };
    default:
      return state;
  }
}

export const DISCOUNT_RATES: Record<DiscountType, number> = {
  none: 0,
  senior: 0.2,
  pwd: 0.2,
  promo10: 0.1,
};

export const DISCOUNT_LABELS: Record<DiscountType, string> = {
  none: "Walang discount",
  senior: "Senior Citizen (20%)",
  pwd: "PWD (20%)",
  promo10: "Promo code (10%)",
};

export function computeTotals(state: Pick<CartState, "lines" | "discount">) {
  const subtotal = state.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const discountRate = DISCOUNT_RATES[state.discount];
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}

export interface CartContextValue {
  state: CartState;
  totals: { subtotal: number; discountAmount: number; total: number };
  addItem: (refId: string, qty?: number) => boolean;
  addCombo: (refId: string, qty?: number) => boolean;
  addAddon: (refId: string, qty?: number) => boolean;
  removeLine: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  findLineByRef: (refId: string) => CartLine | undefined;
  clearCart: () => void;
  setDiscount: (discount: DiscountType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setStage: (stage: OrderStage) => void;
  confirmOrder: () => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (refId: string, qty = 1) => {
      if (!findMenuItem(refId)) return false;
      dispatch({ type: "ADD_LINE", kind: "item", refId, qty });
      return true;
    },
    []
  );

  const addCombo = useCallback((refId: string, qty = 1) => {
    if (!findCombo(refId)) return false;
    dispatch({ type: "ADD_LINE", kind: "combo", refId, qty });
    return true;
  }, []);

  const addAddon = useCallback((refId: string, qty = 1) => {
    if (!findAddon(refId)) return false;
    dispatch({ type: "ADD_LINE", kind: "addon", refId, qty });
    return true;
  }, []);

  const removeLine = useCallback((lineId: string) => {
    dispatch({ type: "REMOVE_LINE", lineId });
  }, []);

  const updateQty = useCallback((lineId: string, qty: number) => {
    dispatch({ type: "UPDATE_QTY", lineId, qty });
  }, []);

  const findLineByRef = useCallback(
    (refId: string) => state.lines.find((l) => l.refId === refId),
    [state.lines]
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const setDiscount = useCallback(
    (discount: DiscountType) => dispatch({ type: "SET_DISCOUNT", discount }),
    []
  );
  const setPaymentMethod = useCallback(
    (method: PaymentMethod) => dispatch({ type: "SET_PAYMENT_METHOD", method }),
    []
  );
  const setStage = useCallback(
    (stage: OrderStage) => dispatch({ type: "SET_STAGE", stage }),
    []
  );
  const confirmOrder = useCallback(() => {
    const orderNumber = `JB-${Math.floor(1000 + Math.random() * 9000)}`;
    dispatch({ type: "CONFIRM_ORDER", orderNumber });
    return orderNumber;
  }, []);

  const totals = useMemo(() => computeTotals(state), [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      totals,
      addItem,
      addCombo,
      addAddon,
      removeLine,
      updateQty,
      findLineByRef,
      clearCart,
      setDiscount,
      setPaymentMethod,
      setStage,
      confirmOrder,
    }),
    [
      state,
      totals,
      addItem,
      addCombo,
      addAddon,
      removeLine,
      updateQty,
      findLineByRef,
      clearCart,
      setDiscount,
      setPaymentMethod,
      setStage,
      confirmOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
