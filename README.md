# castel-fe — Castel web wallet

Frontend for **Castel — Cash on Stellar**: a holiday wallet for the tourists Indonesia's
payment system leaves out. Next.js 16 · Tailwind 4 · Bun.

📖 **Project overview, architecture, security and honest limits → [castel-be/README.md](https://github.com/CastelPay/castel-be#readme)**
🔗 **Live:** [castelpay.vercel.app](https://castelpay.vercel.app)

---

## What this is for

WhatsApp is the account. This web app exists only for the two things a chat cannot do:

- **Use a camera** — `/pay` scans a merchant's QRIS code with the device camera (ZXing).
- **Take a card number** — `/wallet` hands off to Stripe Checkout. A card number is never
  typed into a WhatsApp chat.

Everything else reports back to the chat.

| Route | |
|---|---|
| `/wallet` | Sign in (WhatsApp OTP or magic link), set a PIN, top up by card, balance in **rupiah**, Tier 0 limit, history |
| `/pay` | Scan QRIS → confirm → PIN → paid. Offers a top-up if the balance is short |
| `/cashout` | Request cash → PIN → a pickup QR to show a money-changer agent |
| `/agent` | The agent's side: scan the pickup QR, release the Soroban escrow |

## Auth

The wallet holds a **signed session token**, never a phone number. It is obtained only by
proving control of the WhatsApp number — an OTP delivered over WhatsApp, or a `?t=`
magic-link token exchanged on arrival. A 401 clears the session. Spending prompts for a
6-digit PIN, which never travels through WhatsApp.

## Stellar

- [`public/.well-known/stellar.toml`](https://castelpay.vercel.app/.well-known/stellar.toml) —
  SEP-1 metadata for the cIDR asset and the Castel accounts.
- Every on-chain transaction in the history list links out to Stellar Expert.

## Run

```bash
bun install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL → the backend
bun run dev                    # http://localhost:3000
```

> `NEXT_PUBLIC_*` values are inlined at **build** time — changing one requires a redeploy.

> ⚠️ This is Next.js 16 — read `node_modules/next/dist/docs/` before assuming older APIs
> (see `AGENTS.md`).
