export const formatMoney = (n) => {
  const sign = n >= 0 ? "" : "-";
  return sign + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const formatPct = (n) => (n * 100).toFixed(1) + "¢";
