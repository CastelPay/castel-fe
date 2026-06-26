import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
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
    </main>
  );
}
