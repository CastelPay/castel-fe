# castel-fe — Castel Frontend

Frontend for **Castel (Cash on Stellar)** — WhatsApp-first FX/payment app for Bali tourists. Next.js 16 + Tailwind 4 + Bun.

## Surfaces
- **Web-wallet** (`/wallet`) — no-install PWA launched from WhatsApp via magic link. Live **camera QR scan** (the one thing WhatsApp can't do), balance, rate-comparison, pay/cash-out.
- **Agent app** (`/agent`) — money-changer agent scans tourist pickup codes → release escrow.

## Stack
- `@stellar/stellar-sdk` — read balances, build/submit txns
- `@creit.tech/stellar-wallets-kit` — wallet connect (Freighter etc.) for advanced users
- `@zxing/browser` — camera QR / QRIS scanning

## Run
```bash
bun install
cp .env.example .env.local
bun run dev            # http://localhost:3000
```

> ⚠️ This is Next.js 16 — read `node_modules/next/dist/docs/` before assuming older APIs (see `AGENTS.md`).
