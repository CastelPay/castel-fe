const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Balances = { cIDR: string; USDC: string };

export type Quote = {
  usdc: number;
  cidrOut: number;
  rate: number;
  changerRate: number;
  changerCidr: number;
  savingsIdr: number;
};

export type QrisInfo = {
  merchantName: string;
  city: string;
  amount: number | null;
  currency: string;
  isStatic: boolean;
};

export type PayResult = {
  merchant: string;
  city: string;
  amountIdr: number;
  hash: string;
  balances: Balances;
};

export type Tx = {
  id: number;
  type: "swap" | "pay" | "cashout";
  title: string;
  amountIdr: number;
  direction: "in" | "out";
  hash: string | null;
  createdAt: number;
};

async function req<T>(path: string, opts?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(BASE + path, {
    method: opts?.method ?? "GET",
    headers: opts?.body ? { "content-type": "application/json" } : undefined,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? res.statusText);
  }
  return res.json();
}

export const api = {
  onboard: (waNumber: string) =>
    req<{ waNumber: string; publicKey: string }>("/onboard", { method: "POST", body: { waNumber } }),
  balance: (waNumber: string) =>
    req<Balances>(`/balance/${encodeURIComponent(waNumber)}`),
  quote: (usdc: number) => req<Quote>(`/fx/quote?usdc=${usdc}`),
  fund: (waNumber: string, usdc: number) =>
    req<Balances>("/fund", { method: "POST", body: { waNumber, usdc } }),
  swap: (waNumber: string, usdc: number) =>
    req<{ hash: string; balances: Balances }>("/fx/swap", { method: "POST", body: { waNumber, usdc } }),
  decodeQris: (payload: string) =>
    req<QrisInfo>("/qris/decode", { method: "POST", body: { payload } }),
  pay: (waNumber: string, payload: string, amount?: number) =>
    req<PayResult>("/pay", { method: "POST", body: { waNumber, payload, amount } }),
  cashoutRequest: (waNumber: string, amountIdr: number) =>
    req<{ escrowId: number; codeHex: string; amountIdr: number; balances: Balances }>(
      "/cashout/request",
      { method: "POST", body: { waNumber, amountIdr } },
    ),
  cashoutInfo: (escrowId: number) =>
    req<{ escrowId: number; amountIdr: number; agentReceives: number; status: string }>(
      `/cashout/${escrowId}`,
    ),
  cashoutRedeem: (escrowId: number, codeHex: string) =>
    req<{ escrowId: number; amountIdr: number; agentReceived: number; fee: number }>(
      "/cashout/redeem",
      { method: "POST", body: { escrowId, codeHex } },
    ),
  history: (waNumber: string) => req<Tx[]>(`/history/${encodeURIComponent(waNumber)}`),
};
