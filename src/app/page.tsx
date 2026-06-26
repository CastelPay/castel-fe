import Link from "next/link";

const steps = [
  { n: "1", t: "Chat & top up", d: "Onboard with WhatsApp, fund with USDC or cash at an agent." },
  { n: "2", t: "Fair exchange", d: "Get rupiah at near-market rates — beat the money changers." },
  { n: "3", t: "Pay or cash out", d: "Scan any QRIS to pay, or collect cash at a Castel agent." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="animate-rise">
        <span className="inline-block rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
          Cash on Stellar
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-5xl font-bold leading-tight tracking-tight">
          Digital rupiah,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-end bg-clip-text text-transparent">
            fair rates.
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Exchange money & pay anywhere in Bali — no Indonesian bank account. Just WhatsApp.
        </p>
        <Link
          href="/wallet"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-primary to-primary-end px-7 py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98]"
        >
          Open wallet
        </Link>
      </div>

      <div className="animate-rise mt-16 space-y-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-end text-sm font-bold text-primary-foreground">
              {s.n}
            </div>
            <div>
              <p className="font-semibold">{s.t}</p>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Built on Stellar · merchants always settle in rupiah
      </p>
    </main>
  );
}
