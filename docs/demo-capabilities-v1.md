# Jollibee voice ordering demo – what it can do

**Live demo:** https://jollibee-voice-demo.vercel.app · Works in any modern browser with a microphone. Best experienced with sound on.

## What it is

A working voice-ordering experience for a fast-food kiosk, mobile or web. The customer talks to **Joy**, an AI crew member, and places a complete order entirely by voice – no tapping, no forms. Tagalog is the primary language; Joy switches to English automatically if the customer does, and handles natural Taglish throughout.

## What Joy can do

- **Speaks first** – greets the customer the moment the mic opens and plugs the day's bestsellers by name and price (the same three shown on screen)
- **Takes the full order by voice** – add items, remove them, change quantities, start over; the on-screen order and running total update live with every request
- **Sells, actively** – every item triggers a specific upsell: a combo upgrade ("may kasama nang rice, fries at Coke – ₱179 lahat") or a named add-on with an appetising pitch. No generic "would you like dessert?" – she names the product, the price, and why it's good. Declines are accepted gracefully, and she makes one final dessert push before checkout
- **Handles discounts properly** – asks whether the customer has a Senior Citizen / PWD ID or their own promo code; she never invents or reveals codes
- **Takes payment choice** – cash at counter, card (simulated on-screen gateway) or QR (GCash/Maya, simulated), then confirms the order with an order number
- **Stays grounded** – Joy can only offer items and prices that exist in the menu data; she cannot hallucinate products, prices or promotions

## What the screen shows

The interface is deliberately voice-first: no clickable ordering anywhere. The screen confirms facts – items added with prices, the running total, the exact upsell being offered (with the words to say: "sige" o "oo"), and order confirmation. A collapsible transcript panel shows the full conversation, and the menu sits in a browsable side panel (bottom sheet on mobile) for reference only.

## Scope and limits – important for client conversations

- **Demo menu** – ~29 real Jollibee items and combos with realistic but approximate prices; images are AI-generated, not brand assets
- **No real transactions** – the card gateway and QR payment are simulations; no money moves and no POS/kitchen system is connected
- **Order numbers are mock** – confirmation is visual only
- **Requires internet and a mic** – voice runs on OpenAI's Realtime API; expect ~1 second of response latency
- **Per-session** – each browser tab is one independent kiosk session; there is no account, history or backend

## Why it matters for prospects

Everything brand-specific – the menu, prices, upsell pitches, bestsellers, Joy's persona and language – is configuration, not code. The same build can be re-skinned for another brand (coffee chain, pharmacy, retail) in a day, which is exactly the roadmap: Starbucks and Mercury Drug demos are next in line.

## Suggested 60-second demo script

1. Tap the mic – Joy greets you and names the bestsellers unprompted
2. Say: *"Isang 1-pc Chickenjoy Solo po"* – watch her pitch the combo upgrade and a dessert
3. Decline once, then accept: *"sige"* – the item card and total update live
4. Say: *"Tapos na ako"* – she makes one last dessert push, then opens checkout
5. Answer the discount question, choose *"cash"*, confirm – order number appears
6. Say goodbye – the screen resets for the next customer

---

*Internal note – v1, 8 July 2026. Questions or feature requests: Fareedah.*
