"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { buildSystemInstructions } from "./prompt";
import { createToolHandlers, TOOL_DEFINITIONS } from "./tools";

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

interface TranscriptEntry {
  id: number;
  role: "user" | "assistant";
  text: string;
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

export function useRealtimeVoice({ openCheckout }: { openCheckout: () => void }) {
  const cart = useCart();
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const uiRef = useRef({ openCheckout });
  useEffect(() => {
    uiRef.current = { openCheckout };
  }, [openCheckout]);

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [liveCaption, setLiveCaption] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const idCounterRef = useRef(0);
  const currentAssistantTextRef = useRef("");
  const greetedRef = useRef(false);

  const nextId = () => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  };

  const pushTranscript = useCallback((role: "user" | "assistant", text: string) => {
    if (!text.trim()) return;
    setTranscript((prev) => [...prev.slice(-8), { id: nextId(), role, text }]);
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
    setLiveCaption("");
    setStatus("idle");
  }, []);

  const handleToolCall = useCallback((name: string, args: Record<string, unknown>) => {
    const handlers = createToolHandlers(cartRef.current, uiRef.current);
    const handler = handlers[name];
    if (!handler) return { error: `Unknown tool: ${name}` };
    try {
      return handler(args);
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }, []);

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
            }
            break;

          case "input_audio_buffer.speech_started":
            setStatus("listening");
            break;

          case "conversation.item.input_audio_transcription.completed":
            if (event.transcript) pushTranscript("user", event.transcript);
            break;

          case "response.created":
            currentAssistantTextRef.current = "";
            setLiveCaption("");
            setStatus("speaking");
            break;

          case "response.output_audio_transcript.delta":
          case "response.audio_transcript.delta":
            if (typeof event.delta === "string") {
              currentAssistantTextRef.current += event.delta;
              setLiveCaption(currentAssistantTextRef.current);
            }
            break;

          case "response.output_audio_transcript.done":
          case "response.audio_transcript.done":
            pushTranscript("assistant", currentAssistantTextRef.current);
            currentAssistantTextRef.current = "";
            setLiveCaption("");
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
  }, [handleToolCall, pushTranscript, stop]);

  useEffect(() => () => stop(), [stop]);

  return { status, transcript, liveCaption, errorMessage, start, stop };
}
