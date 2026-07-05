"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, type Balances, type Quote, type Tx } from "@/lib/api";
import { resolveWa } from "@/lib/session";
import { idr } from "@/lib/format";

const EXPLORER = "https://stellar.expert/explorer/testnet/tx/";

const toNum = (s: string) => Number(s);

export default function WalletPage() {
  const [waNumber, setWaNumber] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [balances, setBalances] = useState<Balances | null>(null);
  const [history, setHistory] = useState<Tx[]>([]);
  const [amount, setAmount] = useState("200");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depAmt, setDepAmt] = useState("200");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ m: string; ok: boolean } | null>(null);

  useEffect(() => {
    const saved = resolveWa();
    if (saved) setWaNumber(saved);
  }, []);

  const refresh = useCallback(async (wa: string) => {
    try {
      const [bal, hist] = await Promise.all([api.balance(wa), api.history(wa)]);
      setBalances(bal);
      setHistory(hist);
    } catch {
      setBalances({ cIDR: "0", USDC: "0" });
    }
  }, []);

  useEffect(() => {
    if (waNumber) refresh(waNumber);
  }, [waNumber, refresh]);

  useEffect(() => {
    const usdc = Number(amount);
    const t = setTimeout(async () => {
      if (!usdc || usdc <= 0) {
        setQuote(null);
        return;
      }
      try {
        setQuote(await api.quote(usdc));
      } catch {
        setQuote(null);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [amount]);

  const flash = (m: string, ok = true) => {
    setToast({ m, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Back from Stripe Checkout: confirm the session, then credit is verified server-side.
  useEffect(() => {
    const dep = new URLSearchParams(window.location.search).get("deposit");
    if (!dep) return;
    const wa = resolveWa();
    const cleanUrl = () =>
      window.history.replaceState({}, "", "/wallet" + (wa ? `?wa=${encodeURIComponent(wa)}` : ""));
    if (dep === "cancel") {
      flash("Deposit cancelled", false);
      cleanUrl();
      return;
    }
    (async () => {
      setBusy(true);
      try {
        const res = await api.depositConfirm(dep);
        setBalances(res.balances);
        flash(`Deposited $${res.usd} — USDC added to your wallet`);
        if (wa) refresh(wa);
      } catch (e) {
        flash("Couldn't confirm deposit: " + (e as Error).message, false);
      } finally {
        setBusy(false);
        cleanUrl();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onboard() {
    if (!phone.trim()) return;
    setBusy(true);
    try {
      await api.onboard(phone.trim());
      localStorage.setItem("castel_wa", phone.trim());
      setWaNumber(phone.trim());
    } catch (e) {
      flash("Failed: is the backend running? (" + (e as Error).message + ")", false);
    } finally {
      setBusy(false);
    }
  }

  async function topup() {
    if (!waNumber) return;
    setBusy(true);
    try {
      await api.fund(waNumber, 200);
      await refresh(waNumber);
      flash("Topped up 200 USDC");
    } finally {
      setBusy(false);
    }
  }

  async function startDeposit() {
    if (!waNumber) return;
    const usd = Number(depAmt);
    if (!usd || usd <= 0) {
      flash("Enter an amount", false);
      return;
    }
    setBusy(true);
    try {
      const { url } = await api.depositCreate(waNumber, usd);
      window.location.href = url;
    } catch (e) {
      flash("Couldn't start deposit: " + (e as Error).message, false);
      setBusy(false);
    }
  }

  async function swap() {
    if (!waNumber) return;
    const usdc = Number(amount);
    if (!usdc || usdc > toNum(balances?.USDC ?? "0")) {
      flash("Not enough USDC — top up first", false);
      return;
    }
    setBusy(true);
    try {
      const res = await api.swap(waNumber, usdc);
      setBalances(res.balances);
      flash(quote ? `Exchanged! You saved ${idr(quote.savingsIdr)}` : "Exchanged!");
      refresh(waNumber);
    } catch (e) {
      flash("Exchange failed: " + (e as Error).message, false);
    } finally {
      setBusy(false);
    }
  }

  if (!waNumber) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
        <div className="animate-rise">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight">
            Castel
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fair-rate digital rupiah for your trip to Bali. No bank account needed.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="text-sm font-medium">Your WhatsApp number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 812..."
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-[family-name:var(--font-mono)] outline-none focus:border-primary"
            />
            <button
              onClick={onboard}
              disabled={busy}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-primary to-primary-end py-3 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "Creating wallet…" : "Get started"}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Your Stellar wallet is created automatically — no install, no seed phrase.
          </p>
        </div>
      </main>
    );
  }

  const cidr = toNum(balances?.cIDR ?? "0");
  const usdc = toNum(balances?.USDC ?? "0");

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-24">
      <header className="sticky top-0 z-10 -mx-5 mb-2 border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold">Castel</span>
          <button
            onClick={() => {
              localStorage.removeItem("castel_wa");
              setWaNumber(null);
            }}
            className="text-xs text-muted-foreground"
          >
            {waNumber}
          </button>
        </div>
      </header>

      <section className="animate-rise mt-2 rounded-2xl bg-gradient-to-br from-primary to-primary-end p-6 text-primary-foreground shadow-lg">
        <p className="text-sm opacity-80">Digital rupiah balance</p>
        {balances === null ? (
          <>
            <div className="mt-2 h-9 w-44 animate-pulse rounded-lg bg-white/25" />
            <div className="mt-3 h-4 w-28 animate-pulse rounded bg-white/20" />
          </>
        ) : (
          <>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-4xl font-bold tracking-tight">
              {idr(cidr)}
            </p>
            <p className="mt-3 text-sm opacity-80">
              <span className="font-[family-name:var(--font-mono)]">{usdc.toFixed(2)}</span> USDC available
            </p>
          </>
        )}
        <div className="mt-4">
          {!showDeposit ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeposit(true)}
                disabled={busy}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow transition active:scale-95 disabled:opacity-50"
              >
                + Deposit USD
              </button>
              <button
                onClick={topup}
                disabled={busy}
                className="text-xs text-white/70 underline underline-offset-2 transition active:scale-95 disabled:opacity-50"
              >
                instant demo
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-lg">$</span>
                <input
                  type="number"
                  value={depAmt}
                  onChange={(e) => setDepAmt(e.target.value)}
                  className="w-full min-w-0 rounded-lg bg-white/90 px-3 py-2 font-[family-name:var(--font-mono)] text-lg text-foreground outline-none"
                />
              </div>
              <div className="mt-2 flex gap-2">
                {[50, 100, 200].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDepAmt(String(v))}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium transition active:scale-95"
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <button
                onClick={startDeposit}
                disabled={busy}
                className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-primary shadow transition active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "Redirecting…" : "Pay with card →"}
              </button>
              <p className="mt-2 text-center text-[11px] text-white/70">
                Test card 4242 4242 4242 4242 · any future date · any CVC
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="animate-rise mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/pay"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 font-semibold shadow-sm transition active:scale-[0.99]"
        >
          <span>📷</span> Pay QRIS
        </Link>
        <Link
          href="/cashout"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 font-semibold shadow-sm transition active:scale-[0.99]"
        >
          <span>💵</span> Get cash
        </Link>
      </div>

      <section className="animate-rise mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Exchange to rupiah</h2>

        <label className="mt-4 block text-sm text-muted-foreground">USDC amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 font-[family-name:var(--font-mono)] text-lg outline-none focus:border-primary"
        />
        <div className="mt-2 flex gap-2">
          {[50, 100, 200].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition active:scale-95"
            >
              ${v}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(usdc)))}
            disabled={!usdc}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition active:scale-95 disabled:opacity-40"
          >
            Max
          </button>
        </div>

        {quote && (
          <div className="mt-4 space-y-3 rounded-xl bg-muted/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You receive</span>
              <span className="font-[family-name:var(--font-mono)] text-lg font-bold">
                {idr(quote.cidrOut)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Castel rate</span>
              <span className="font-[family-name:var(--font-mono)]">{quote.rate.toFixed(0)} /USD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Money changer</span>
              <span className="font-[family-name:var(--font-mono)] text-muted-foreground line-through">
                {idr(quote.changerCidr)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-success-soft px-3 py-2">
              <span className="text-sm font-medium text-success">💰 You save</span>
              <span className="font-[family-name:var(--font-mono)] font-bold text-success">
                {idr(quote.savingsIdr)}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={swap}
          disabled={busy || !quote}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-primary to-primary-end py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Processing…" : "Exchange now"}
        </button>
      </section>

      {history.length > 0 && (
        <section className="animate-rise mt-6">
          <h2 className="px-1 font-[family-name:var(--font-heading)] text-sm font-semibold text-muted-foreground">
            Recent activity
          </h2>
          <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                    tx.direction === "in" ? "bg-success-soft text-success" : "bg-muted text-foreground"
                  }`}
                >
                  {tx.type === "swap"
                    ? "⇄"
                    : tx.type === "pay"
                      ? "↑"
                      : tx.type === "deposit"
                        ? "＄"
                        : "↓"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.title}</p>
                  {tx.hash && (
                    <a
                      href={EXPLORER + tx.hash}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary"
                    >
                      View on-chain ↗
                    </a>
                  )}
                </div>
                <span
                  className={`shrink-0 font-[family-name:var(--font-mono)] text-sm font-semibold ${
                    tx.direction === "in" ? "text-success" : "text-foreground"
                  }`}
                >
                  {tx.direction === "in" ? "+" : "−"}
                  {tx.type === "deposit" ? `$${tx.amountIdr}` : idr(tx.amountIdr)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div
          className={`animate-rise fixed inset-x-0 bottom-6 mx-auto w-fit max-w-[90%] rounded-full px-5 py-3 text-center text-sm shadow-xl ${
            toast.ok ? "bg-foreground text-background" : "bg-destructive text-white"
          }`}
        >
          {toast.m}
        </div>
      )}
    </main>
  );
}
