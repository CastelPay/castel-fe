"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));

type Ticket = { escrowId: number; codeHex: string; amountIdr: number; agentReceives: number };
type Stage = "scan" | "confirm" | "done";

function parse(text: string): { escrowId: number; codeHex: string } | null {
  const m = text.match(/^castel:(\d+):([0-9a-f]+)$/i);
  return m ? { escrowId: Number(m[1]), codeHex: m[2] } : null;
}

export default function AgentPage() {
  const [stage, setStage] = useState<Stage>("scan");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [paid, setPaid] = useState(0);
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

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
          handleScan(result.getText());
        }
      })
      .catch(() => setError("Camera unavailable — paste a code below"));
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [stage]);

  async function handleScan(text: string) {
    const parsed = parse(text.trim());
    if (!parsed) {
      setError("Not a Castel pickup code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const info = await api.cashoutInfo(parsed.escrowId);
      if (info.status === "paid") {
        setError("This pickup was already paid out");
        setStage("scan");
        return;
      }
      setTicket({ ...parsed, amountIdr: info.amountIdr, agentReceives: info.agentReceives });
      setStage("confirm");
    } catch {
      setError("Couldn't find this pickup");
      setStage("scan");
    } finally {
      setBusy(false);
    }
  }

  async function release() {
    if (!ticket) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.cashoutRedeem(ticket.escrowId, ticket.codeHex);
      setPaid(res.agentReceived);
      setStage("done");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-24">
      <header className="sticky top-0 z-10 -mx-5 mb-4 border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-heading)] font-bold">Castel Agent</span>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            money changer
          </span>
        </div>
      </header>

      {stage === "scan" && (
        <div className="animate-rise">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Scan pickup code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan the tourist&apos;s code to release their cash.
          </p>
          <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-foreground/5">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80" />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">No camera? Paste the pickup code</p>
            <div className="mt-2 flex gap-2">
              <input
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="castel:1:abcd…"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-[family-name:var(--font-mono)] text-xs outline-none focus:border-primary"
              />
              <button
                onClick={() => handleScan(pasted)}
                disabled={!pasted || busy}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {busy ? "…" : "Load"}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {stage === "confirm" && ticket && (
        <div className="animate-rise">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Hand the tourist</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-4xl font-bold">
              {idr(ticket.amountIdr)}
            </p>
            <div className="mt-4 rounded-xl bg-success-soft px-4 py-3">
              <p className="text-sm text-success">
                You receive{" "}
                <span className="font-[family-name:var(--font-mono)] font-bold">
                  {idr(ticket.agentReceives)}
                </span>{" "}
                in cIDR (1% platform fee)
              </p>
            </div>
          </div>
          {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
          <button
            onClick={release}
            disabled={busy}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-primary to-primary-end py-3.5 font-semibold text-primary-foreground shadow-md transition active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Releasing escrow…" : "I handed over the cash"}
          </button>
          <button
            onClick={() => {
              setStage("scan");
              setTicket(null);
              setError(null);
            }}
            className="mt-3 w-full py-2 text-sm text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {stage === "done" && (
        <div className="animate-rise flex flex-col items-center pt-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-3xl text-success">
            ✓
          </div>
          <p className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold">Released</p>
          <p className="mt-1 text-muted-foreground">
            {idr(paid)} cIDR settled to your account on-chain.
          </p>
          <button
            onClick={() => {
              setTicket(null);
              setStage("scan");
            }}
            className="mt-6 w-full rounded-full border border-border py-3 font-medium"
          >
            Scan next
          </button>
        </div>
      )}
    </main>
  );
}
