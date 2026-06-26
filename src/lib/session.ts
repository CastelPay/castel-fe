export function resolveWa(): string | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get("wa");
  if (param) {
    localStorage.setItem("castel_wa", param);
    return param;
  }
  return localStorage.getItem("castel_wa");
}
