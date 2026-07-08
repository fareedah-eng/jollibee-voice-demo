import { ADDONS, COMBOS, findMenuItem } from "@/lib/menu";
import type { CartContextValue, DiscountType, PaymentMethod } from "@/lib/cart";

/** An upsell Joy is about to offer, surfaced so the UI can show it as a card. */
export interface UpsellSuggestion {
  refId: string;
  kind: "addon" | "combo";
  name: string;
  price: number;
  image?: string;
}

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    name: "add_item",
    description: "Add a menu item to the customer's cart by its exact item id.",
    parameters: {
      type: "object",
      properties: {
        item_id: { type: "string", description: "Exact menu item id from the MENU list." },
        quantity: { type: "integer", minimum: 1 },
      },
      required: ["item_id"],
    },
  },
  {
    type: "function",
    name: "add_combo",
    description: "Add a combo / value-meal bundle to the cart by its exact combo id.",
    parameters: {
      type: "object",
      properties: {
        combo_id: { type: "string", description: "Exact combo id from the Combos list." },
        quantity: { type: "integer", minimum: 1 },
      },
      required: ["combo_id"],
    },
  },
  {
    type: "function",
    name: "add_addon",
    description: "Add a standalone add-on (extra drink, side, dessert, or upsize) to the cart by its exact addon id.",
    parameters: {
      type: "object",
      properties: {
        addon_id: { type: "string", description: "Exact addon id from the Add-ons list." },
        quantity: { type: "integer", minimum: 1 },
      },
      required: ["addon_id"],
    },
  },
  {
    type: "function",
    name: "remove_line",
    description: "Remove an item, combo, or addon from the cart entirely, by its id.",
    parameters: {
      type: "object",
      properties: { ref_id: { type: "string" } },
      required: ["ref_id"],
    },
  },
  {
    type: "function",
    name: "update_quantity",
    description: "Change the quantity of an item/combo/addon already in the cart. Use quantity 0 to remove it.",
    parameters: {
      type: "object",
      properties: {
        ref_id: { type: "string" },
        quantity: { type: "integer", minimum: 0 },
      },
      required: ["ref_id", "quantity"],
    },
  },
  {
    type: "function",
    name: "get_cart",
    description: "Get the current cart contents and totals. Call this to confirm what's in the cart or read back the order.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "list_addons_for_item",
    description:
      "Get real, orderable add-on suggestions (drinks/sides/desserts) for a given menu item id. Always call this before upselling so you only offer real add-ons and prices.",
    parameters: {
      type: "object",
      properties: { item_id: { type: "string" } },
      required: ["item_id"],
    },
  },
  {
    type: "function",
    name: "suggest_combo_for_item",
    description:
      "Find a real combo/value-meal bundle that includes a given menu item id, with accurate pricing, to offer a 'make it a combo' upgrade.",
    parameters: {
      type: "object",
      properties: { item_id: { type: "string" } },
      required: ["item_id"],
    },
  },
  {
    type: "function",
    name: "apply_discount",
    description: "Record the discount the customer is eligible for (or 'none').",
    parameters: {
      type: "object",
      properties: {
        discount_type: { type: "string", enum: ["none", "senior", "pwd", "promo10"] },
      },
      required: ["discount_type"],
    },
  },
  {
    type: "function",
    name: "set_payment_method",
    description: "Record how the customer wants to pay.",
    parameters: {
      type: "object",
      properties: { method: { type: "string", enum: ["cash", "card", "qr"] } },
      required: ["method"],
    },
  },
  {
    type: "function",
    name: "start_checkout",
    description: "Open checkout once the customer says they're done ordering.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "confirm_order",
    description:
      "Finalize and place the order for cash or QR payment, after a payment method has been set. Do NOT call this for card — card payments are completed by the customer on-screen and confirm automatically.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "resume_ordering",
    description:
      "Close checkout and go back to ordering, keeping the cart as-is — use when the customer wants to add or change something before finishing checkout (e.g. 'wait, let me also get fries').",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "clear_cart",
    description:
      "Empty the cart completely and close checkout if it's open — use when the customer wants to start over, or is done after their order was confirmed (e.g. they say bye or want a new order).",
    parameters: { type: "object", properties: {} },
  },
];

function summarize(cart: CartContextValue) {
  return {
    lines: cart.state.lines.map((l) => ({
      ref_id: l.refId,
      name: l.name,
      unit_price: l.unitPrice,
      quantity: l.qty,
      line_total: l.unitPrice * l.qty,
    })),
    subtotal: cart.totals.subtotal,
    discount: cart.state.discount,
    discount_amount: cart.totals.discountAmount,
    total: cart.totals.total,
    payment_method: cart.state.paymentMethod,
    stage: cart.state.stage,
  };
}

export function createToolHandlers(
  cart: CartContextValue,
  ui: { openCheckout: () => void; onSuggest?: (suggestions: UpsellSuggestion[]) => void }
): Record<string, (args: Record<string, unknown>) => unknown> {
  return {
    add_item: ({ item_id, quantity }) => {
      const ok = cart.addItem(String(item_id), Number(quantity) || 1);
      if (!ok) return { error: `Unknown item_id: ${item_id}` };
      return summarize(cart);
    },
    add_combo: ({ combo_id, quantity }) => {
      const ok = cart.addCombo(String(combo_id), Number(quantity) || 1);
      if (!ok) return { error: `Unknown combo_id: ${combo_id}` };
      return summarize(cart);
    },
    add_addon: ({ addon_id, quantity }) => {
      const ok = cart.addAddon(String(addon_id), Number(quantity) || 1);
      if (!ok) return { error: `Unknown addon_id: ${addon_id}` };
      return summarize(cart);
    },
    remove_line: ({ ref_id }) => {
      const line = cart.findLineByRef(String(ref_id));
      if (!line) return { error: `No cart line for ref_id: ${ref_id}` };
      cart.removeLine(line.lineId);
      return summarize(cart);
    },
    update_quantity: ({ ref_id, quantity }) => {
      const line = cart.findLineByRef(String(ref_id));
      if (!line) return { error: `No cart line for ref_id: ${ref_id}` };
      cart.updateQty(line.lineId, Number(quantity));
      return summarize(cart);
    },
    get_cart: () => summarize(cart),
    list_addons_for_item: ({ item_id }) => {
      const item = findMenuItem(String(item_id));
      if (!item) return { error: `Unknown item_id: ${item_id}` };
      const addons = (item.addonIds ?? [])
        .map((id) => ADDONS.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a));
      ui.onSuggest?.(
        addons.map((a) => ({ refId: a.id, kind: "addon", name: a.name, price: a.price, image: a.image }))
      );
      return { addons: addons.map((a) => ({ addon_id: a.id, name: a.name, price: a.price, pitch: a.pitch })) };
    },
    suggest_combo_for_item: ({ item_id }) => {
      const combos = COMBOS.filter((c) => c.itemIds.includes(String(item_id)));
      ui.onSuggest?.(
        combos.map((c) => ({ refId: c.id, kind: "combo", name: c.name, price: c.price, image: c.image }))
      );
      return {
        combos: combos.map((c) => ({ combo_id: c.id, name: c.name, price: c.price, description: c.description })),
      };
    },
    apply_discount: ({ discount_type }) => {
      cart.setDiscount(discount_type as DiscountType);
      return summarize(cart);
    },
    set_payment_method: ({ method }) => {
      cart.setPaymentMethod(method as PaymentMethod);
      return summarize(cart);
    },
    start_checkout: () => {
      cart.setStage("checkout");
      ui.openCheckout();
      return summarize(cart);
    },
    confirm_order: () => {
      if (!cart.state.paymentMethod) {
        return { error: "No payment method set yet — ask how they'd like to pay first." };
      }
      if (cart.state.paymentMethod === "card") {
        return {
          error:
            "Card payments are completed on-screen by the customer, not by you. Tell them to enter their card details on the gateway shown — do not call confirm_order for card payments.",
        };
      }
      const orderNumber = cart.confirmOrder();
      return { ...summarize(cart), order_number: orderNumber };
    },
    resume_ordering: () => {
      cart.setStage("ordering");
      return summarize(cart);
    },
    clear_cart: () => {
      cart.clearCart();
      return { cleared: true };
    },
  };
}
