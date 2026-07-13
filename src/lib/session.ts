const KEY = "castel_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

/** A magic link from WhatsApp arrives as ?t=<linkToken>; it is spent for a session. */
export function takeLinkToken(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("t");
}
