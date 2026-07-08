"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DISCOUNT_LABELS, useCart, type DiscountType } from "@/lib/cart";
import { findAddon, findCombo, findMenuItem, getFeaturedBestsellers } from "@/lib/menu";
import { buildSystemInstructions } from "./prompt";
import { createToolHandlers, TOOL_DEFINITIONS, type UpsellSuggestion } from "./tools";

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

/**
 * A fact card shown on the voice stage — the screen shows only what happened
 * (items, prices, totals); Joy's voice carries everything else.
 */
export interface ActionCard {
  id: number;
  kind: "bestsellers" | "added" | "removed" | "qty" | "discount" | "payment" | "confirmed";
  title: string;
  qty?: number;
  price?: number;
  image?: string;
  /** Running order total after this action. */
  total?: number;
  /** For the bestsellers welcome card. */
  items?: Array<{ name: string; price: number; image?: string }>;
}

interface RealtimeEvent {
  type: string;
  delta?: string;
  transcript?: string;
  response?: { output?: RealtimeOutputItem[] };
  [key: string]: unknown;
}

interface RealtimeOutputItem {
  type: string;
  name?: string;
  call_id?: string;
  arguments?: string;
}

const PAYMENT_TITLES: Record<string, string> = {
  cash: "Bayad — Cash sa counter",
  card: "Bayad — Card",
  qr: "Bayad — QR (GCash/Maya)",
};

function bestsellersCard(id: number): ActionCard {
  return {
    id,
    kind: "bestsellers",
    title: "Mga bestseller ngayon",
    items: getFeaturedBestsellers(),
  };
}

export function useRealtimeVoice({ openCheckout }: { openCheckout: () => void }) {
  const cart = useCart();
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actions, setActions] = useState<ActionCard[]>([]);
  const [suggestions, setSuggestions] = useState<UpsellSuggestion[]>([]);

  const uiRef = useRef({ openCheckout, onSuggest: setSuggestions });
  useEffect(() => {
    uiRef.current = { openCheckout, onSuggest: setSuggestions };
  }, [openCheckout]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const idCounterRef = useRef(0);
  const greetedRef = useRef(false);

  const nextId = () => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  const pushAction = useCallback((card: Omit<ActionCard, "id">) => {
    setActions((prev) => [...prev.slice(-3), { ...card, id: idCounterRef.current + 1 }]);
    idCounterRef.current += 1;
  }, []);

  const stop = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioElRef.current?.remove();
    dcRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
    audioElRef.current = null;
    setActions([]);
    setSuggestions([]);
    setStatus("idle");
  }, []);

  /** Turn a successful tool call into the fact card the customer should see. */
  const cardForToolCall = useCallback(
    (name: string, args: Record<string, unknown>, result: Record<string, unknown>): Omit<ActionCard, "id"> | null => {
      if (result && typeof result === "object" && "error" in result) return null;
      const total = typeof result?.total === "number" ? (result.total as number) : undefined;

      switch (name) {
        case "add_item": {
          const item = findMenuItem(String(args.item_id));
          if (!item) return null;
          const qty = Number(args.quantity) || 1;
          return { kind: "added", title: item.name, qty, price: item.price, image: item.image, total };
        }
        case "add_combo": {
          const combo = findCombo(String(args.combo_id));
          if (!combo) return null;
          const qty = Number(args.quantity) || 1;
          return { kind: "added", title: combo.name, qty, price: combo.price, image: combo.image, total };
        }
        case "add_addon": {
          const addon = findAddon(String(args.addon_id));
          if (!addon) return null;
          const qty = Number(args.quantity) || 1;
          return { kind: "added", title: addon.name, qty, price: addon.price, image: addon.image, total };
        }
        case "remove_line": {
          const ref = String(args.ref_id);
          const name = findMenuItem(ref)?.name ?? findCombo(ref)?.name ?? findAddon(ref)?.name ?? ref;
          return { kind: "removed", title: name, total };
        }
        case "update_quantity": {
          const ref = String(args.ref_id);
          const name = findMenuItem(ref)?.name ?? findCombo(ref)?.name ?? findAddon(ref)?.name ?? ref;
          return { kind: "qty", title: name, qty: Number(args.quantity), total };
        }
        case "apply_discount": {
          const type = String(args.discount_type) as DiscountType;
          if (type === "none") return null;
          return { kind: "discount", title: DISCOUNT_LABELS[type] ?? type, total };
        }
        case "set_payment_method":
          return { kind: "payment", title: PAYMENT_TITLES[String(args.method)] ?? String(args.method), total };
        case "confirm_order":
          return {
            kind: "confirmed",
            title: `Order #${String(result?.order_number ?? "")}`,
            total,
          };
        default:
          return null;
      }
    },
    []
  );

  const handleToolCall = useCallback(
    (name: string, args: Record<string, unknown>) => {
      const handlers = createToolHandlers(cartRef.current, uiRef.current);
      const handler = handlers[name];
      if (!handler) return { error: `Unknown tool: ${name}` };
      try {
        const result = handler(args) as Record<string, unknown>;
        const card = cardForToolCall(name, args, result);
        if (card) {
          pushAction(card);
          // A concrete cart action supersedes any pending offer.
          if (card.kind === "added" || card.kind === "removed") setSuggestions([]);
        }
        if (name === "clear_cart") setActions([]);
        return result;
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },
    [cardForToolCall, pushAction]
  );

  const start = useCallback(async () => {
    try {
      setErrorMessage(null);
      setStatus("connecting");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.style.display = "none";
      // In the DOM + explicit play(): detached audio elements can be silently
      // ignored by autoplay policies, which made Joy's greeting text-only.
      document.body.appendChild(audioEl);
      audioElRef.current = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        audioEl.play().catch(() => {
          /* autoplay fallback — resolved by the user's start tap gesture */
        });
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      greetedRef.current = false;
      dc.addEventListener("open", () => {
        dc.send(
          JSON.stringify({
            type: "session.update",
            session: {
              type: "realtime",
              output_modalities: ["audio"],
              instructions: buildSystemInstructions(),
              tools: TOOL_DEFINITIONS,
              tool_choice: "auto",
              audio: {
                input: {
                  turn_detection: {
                    type: "semantic_vad",
                    create_response: true,
                    interrupt_response: true,
                  },
                  transcription: { model: "whisper-1" },
                },
              },
            },
          })
        );
        setStatus("listening");
      });

      dc.addEventListener("close", () => setStatus("idle"));

      dc.addEventListener("message", (e) => {
        let event: RealtimeEvent;
        try {
          event = JSON.parse(e.data);
        } catch {
          return;
        }

        switch (event.type) {
          case "session.updated":
            // Greet only after our instructions are confirmed applied —
            // firing response.create immediately after session.update raced
            // it, producing a greeting without our audio/persona config.
            if (!greetedRef.current) {
              greetedRef.current = true;
              dc.send(
                JSON.stringify({
                  type: "response.create",
                  response: { output_modalities: ["audio"] },
                })
              );
              // The bestsellers Joy is naming out loud, visible while she talks.
              pushAction(bestsellersCard(nextId()));
            }
            break;

          case "input_audio_buffer.speech_started":
            // The offer moment has passed — if they accepted, the "added"
            // card lands right after; if they declined, the card shouldn't
            // linger on screen.
            setStatus("listening");
            setSuggestions([]);
            break;

          case "response.created":
            setStatus("speaking");
            break;

          case "response.done": {
            setStatus("listening");
            const output = event.response?.output ?? [];
            const functionCalls = output.filter((item) => item.type === "function_call");
            for (const item of functionCalls) {
              if (!item.name || !item.call_id) continue;
              let args: Record<string, unknown> = {};
              try {
                args = item.arguments ? JSON.parse(item.arguments) : {};
              } catch {
                // ignore malformed arguments, handler will get {}
              }
              const result = handleToolCall(item.name, args);
              dc.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: item.call_id,
                    output: JSON.stringify(result),
                  },
                })
              );
            }
            if (functionCalls.length > 0) {
              dc.send(JSON.stringify({ type: "response.create" }));
            }
            break;
          }

          case "error":
            console.error("Realtime error event", event);
            break;

          default:
            break;
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const resp = await fetch("/api/session", {
        method: "POST",
        body: offer.sdp,
        headers: { "Content-Type": "application/sdp" },
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Session request failed (${resp.status})`);
      }

      const answerSdp = await resp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStatus("error");
      stop();
    }
  }, [handleToolCall, pushAction, stop]);

  useEffect(() => () => stop(), [stop]);

  return { status, actions, suggestions, errorMessage, start, stop };
}
