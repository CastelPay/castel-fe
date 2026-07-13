"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, type Balances, type PayResult, type QrisInfo } from "@/lib/api";
import { PinPrompt } from "@/components/PinPrompt";
import { getToken } from "@/lib/session";
import { idr } from "@/lib/format";

const SAMPLE_QR =
  "00020101021253033605405850005802ID5916Warung Made Bali6004Bali6304ABCD";

type Stage = "scan" | "review" | "done";

export default function PayPage() {
  const [wa, setWa] = useState<string | null>(null);
  const [askPin, setAskPin] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("scan");
  const [payload, setPayload] = useState("");
  const [info, setInfo] = useState<QrisInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    merchant: string;
    amountIdr: number;
    balances: Balances;
    settlement: PayResult["settlement"];
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    setWa(getToken());
    api
      .balance()
      .then((b) => setBalance(Number(b.cIDR)))
      .catch(() => setBalance(null));
  }, []);

  useEffect(() => {
    if (stage !== "scan" || !videoRef.current) return;
    let active = true;
    const reader = new BrowserQRCodeReader();
    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, controls) => {
        controlsRef.current = controls;
        if (result && active) {
          active = false;
          controls.stop();
          handlePayload(result.getText());
        }
      })
      .catch(() => setError("Camera unavailable — paste a code below"));
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [stage]);

  async function handlePayload(p: string) {
    setBusy(true);
    setError(null);
    try {
      const decoded = await api.decodeQris(p);
      setPayload(p);
      setInfo(decoded);
      setAmount(decoded.amount ? String(decoded.amount) : "");
      setStage("review");
    } catch {
      setError("Couldn't read this QR code");
    } finally {
      setBusy(false);
    }
  }

  async function confirmPay(pin: string) {
    if (!info) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.pay(payload, pin, info.amount ?? Number(amount));
      setReceipt({
        merchant: res.merchant,
        amountIdr: res.amountIdr,
        balances: res.balances,
        settlement: res.settlement,
      });
      setAskPin(false);
      setStage("done");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!wa) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <p className="text-muted-foreground">Open your wallet first.</p>
        <Link href="/wallet" className="mt-4 font-medium text-primary">
          Go to wallet →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-24">
      <header className="sticky top-0 z-10 -mx-5 mb-4 border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link href="/wallet" className="text-sm text-muted-foreground">
            ← Wallet
          </Link>
          <span className="font-[family-name:var(--font-heading)] font-bold">Pay</span>
        </div>
      </header>

      {stage === "scan" && (
        <div className="animate-rise">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Scan QRIS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Point your camera at any merchant&apos;s QRIS code.
          </p>

          <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-foreground/5">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80" />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">No camera? Paste a QRIS payload</p>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={2}
              placeholder="00020101..."
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 font-[family-name:var(--font-mono)] text-xs outline-none focus:border-primary"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handlePayload(payload)}
                disabled={!payload || busy}
                className="flex-1 rounded-full bg-foreground py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {busy ? "Reading…" : "Read code"}
              </button>
              <button
                onClick={() => handlePayload(SAMPLE_QR)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium"
              >
                Use sample
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {stage === "review" && info && (() => {
        const due = info.amount ?? (Number(amount) || 0);
        const short = balance !== null && due > 0 && balance < due;
        return (
        <div className="animate-rise">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Paying</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-xl font-bold">
              {info.merchantName}
            </p>
            {info.city && <p className="text-xs text-muted-foreground">{info.city}</p>}

            {info.isStatic ? (
              <div className="mt-5 text-left">
                <label className="text-sm text-muted-foreground">Amount (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="85000"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-[family-name:var(--font-mono)] text-2xl outline-none focus:border-primary"
                />
              </div>
            ) : (
              <p className="mt-5 font-[family-name:var(--font-mono)] text-4xl font-bold">
                {idr(info.amount!)}
              </p>
            )}
          </div>

          {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}

          {short ? (
            <>
              <div className="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-center">
                <p className="text-sm font-semibold">Not enough balance</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You have {idr(balance ?? 0)} — you need {idr(due)}.
                </p>
              </div>
              <Link
                href="/wallet?topup=1"
                className="mt-3 block w-full rounded-full bg-gradient-to-r from-primary to-primary-end py-3.5 text-center font-semibold text-primary-foreground shadow-md transition active:scale-[0.98]"
              >
                Top up with card →
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                setError(null);
                setAskPin(true);
              }}
              disabled={busy || (info.isStatic && !Number(amount))}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-primary to-primary-end py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "Paying…" : `Pay ${idr(due)}`}
            </button>
          )}

          {askPin && (
            <PinPrompt
              title={`Pay ${idr(due)}`}
              subtitle={`To ${info.merchantName}. Enter your PIN to authorise.`}
              busy={busy}
              error={error}
              onSubmit={confirmPay}
              onCancel={() => setAskPin(false)}
            />
          )}
          <button
            onClick={() => {
              setStage("scan");
              setError(null);
            }}
            className="mt-3 w-full py-2 text-sm text-muted-foreground"
          >
            Cancel
          </button>
        </div>
        );
      })()}

      {stage === "done" && receipt && (
        <div className="animate-rise flex flex-col items-center pt-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-3xl text-success">
            ✓
          </div>
          <p className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold">Paid</p>
          <p className="mt-1 text-muted-foreground">
            {idr(receipt.amountIdr)} to {receipt.merchant}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Merchant received Indonesian rupiah.</p>

          <div className="mt-6 w-full rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Balance left</span>
              <span className="font-[family-name:var(--font-mono)] font-bold">
                {idr(Number(receipt.balances.cIDR))}
              </span>
            </div>
            {receipt.settlement && "id" in receipt.settlement && (
              <div className="mt-3 border-t border-border pt-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Merchant settlement</span>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                    {receipt.settlement.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  IDR sent via Xendit · {receipt.settlement.channel} ·{" "}
                  <span className="font-[family-name:var(--font-mono)]">
                    {receipt.settlement.id.slice(0, 12)}…
                  </span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setReceipt(null);
              setInfo(null);
              setPayload("");
              setStage("scan");
            }}
            className="mt-6 w-full rounded-full border border-border py-3 font-medium"
          >
            Pay again
          </button>
          <Link href="/wallet" className="mt-3 text-sm text-primary">
            Back to wallet
          </Link>
        </div>
      )}
    </main>
  );
}
