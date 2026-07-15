import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const startSteps = [
  {
    n: "1",
    t: "Sign in with WhatsApp",
    d: "Enter your number with country code, then the 6-digit code we send you on WhatsApp.",
  },
  {
    n: "2",
    t: "Set your 6-digit PIN",
    d: "Pick a PIN once. You'll enter it every time you pay.",
  },
  {
    n: "3",
    t: "Top up with your card (optional)",
    d: "Tap + Add money, enter a USD amount, and see how much rupiah you get. Pay by card and your rupiah balance is ready.",
  },
];

const paySteps = [
  {
    n: "1",
    t: "Scan the QRIS code",
    d: "Tap to start your camera and point it at any merchant's QRIS code.",
  },
  {
    n: "2",
    t: "Check the merchant",
    d: "You'll see the merchant name and city. If the code is static, type the amount in rupiah; if it's dynamic, the amount is already filled in.",
  },
  {
    n: "3",
    t: "Choose how to pay",
    d: "Pay from your balance, or use Quick Pay to charge your card for just this payment. Confirm from balance with your PIN.",
  },
  {
    n: "4",
    t: "Paid in rupiah",
    d: "You land on a receipt and the merchant receives an ordinary QRIS payment in Indonesian rupiah.",
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto max-w-md overflow-hidden px-6 py-16">
      <Reveal />
      <div className="aurora" aria-hidden />

      {/* Hero */}
      <div className="animate-rise relative z-10">
        <h1 className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-tight tracking-tight">
          Pay in Bali,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-end bg-clip-text text-transparent">
            Directly from your card.
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Scan any QRIS merchant, no Indonesian bank account, SIM, or ID card needed.
        </p>
        <Link
          href="/wallet"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-primary to-primary-end px-7 py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98]"
        >
          Connect Wallet
        </Link>
      </div>

      {/* Centerpiece: Two ways to pay */}
      <section className="relative z-10 mt-16">
        <h2
          data-reveal
          className="reveal px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Two ways to pay
        </h2>
        <div className="mt-3 space-y-3">
          {/* Featured card wrapped in a gradient hairline ring */}
          <div
            data-reveal
            className="reveal rounded-2xl bg-gradient-to-br from-primary/40 to-primary-end/40 p-[1px] shadow-md"
            style={{ "--i": 1 } as CSSProperties}
          >
            <div className="rounded-2xl bg-card p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                  Pay from balance
                </p>
                <span className="shrink-0 rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
                  Cheapest
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Top up once, spend all trip. Every payment comes out of your rupiah balance and
                costs nothing extra. Just confirm with your PIN.
              </p>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-sm font-semibold text-primary">
                Pay Rp X from balance
              </p>
            </div>
          </div>

          <div
            data-reveal
            className="reveal rounded-2xl border border-border bg-card p-6 shadow-sm"
            style={{ "--i": 2 } as CSSProperties}
          >
            <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">
              Quick Pay
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No top-up needed. Your card is charged for just this payment, then you land straight
              on the receipt.
            </p>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-sm font-semibold text-primary">
              Quick pay Rp X with card
            </p>
          </div>
        </div>
        <p
          data-reveal
          className="reveal mt-3 px-1 text-xs text-muted-foreground"
          style={{ "--i": 3 } as CSSProperties}
        >
          Balance short? The app flags it and switches you to Quick Pay automatically, so you&apos;re
          never stuck at the counter.
        </p>
      </section>

      {/* Get started */}
      <section className="relative z-10 mt-14 space-y-3">
        <h2
          data-reveal
          className="reveal px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Get started in 60 seconds
        </h2>
        {startSteps.map((s, i) => (
          <div
            key={s.n}
            data-reveal
            className="reveal flex gap-4 rounded-2xl border border-border bg-card p-4"
            style={{ "--i": i + 1 } as CSSProperties}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-end text-sm font-bold text-primary-foreground">
              {s.n}
            </div>
            <div>
              <p className="font-semibold">{s.t}</p>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Paying a merchant */}
      <section className="relative z-10 mt-14 space-y-3">
        <h2
          data-reveal
          className="reveal px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Paying a merchant
        </h2>
        {paySteps.map((s, i) => (
          <div
            key={s.n}
            data-reveal
            className="reveal flex gap-4 rounded-2xl border border-border bg-card p-4"
            style={{ "--i": i + 1 } as CSSProperties}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-end text-sm font-bold text-primary-foreground">
              {s.n}
            </div>
            <div>
              <p className="font-semibold">{s.t}</p>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <div data-reveal className="reveal relative z-10 mt-14 flex flex-col items-center">
        <Link
          href="/wallet"
          className="rounded-full bg-gradient-to-r from-primary to-primary-end px-7 py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98]"
        >
          Connect Wallet
        </Link>
        <Link href="/pay" className="mt-4 text-sm font-medium text-muted-foreground">
          Try a payment →
        </Link>
      </div>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        Built on Stellar
      </p>
    </main>
  );
}
