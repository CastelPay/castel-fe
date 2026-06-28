export const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));
