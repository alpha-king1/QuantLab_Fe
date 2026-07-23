/* -------------------------------------------------------------------------- */
/*  Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function pct(value, decimals = 2) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function signedPct(value, decimals = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const v = value * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}

export function money(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function num(value, decimals = 4) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(decimals);
}

/* -------------------------------------------------------------------------- */
/*  Derived metrics — computed straight from returned JSON, nothing invented  */
/* -------------------------------------------------------------------------- */

// Running peak-to-trough drawdown from an equity curve, as a negative fraction.
export function computeMaxDrawdown(equity) {
  if (!equity || equity.length === 0) return null;
  let peak = -Infinity;
  let maxDD = 0;
  for (const point of equity) {
    if (point.balance > peak) peak = point.balance;
    const dd = peak > 0 ? (point.balance - peak) / peak : 0;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

// Approximate profit factor from aggregate win-rate + average win/loss stats.
export function computeProfitFactor(stat, winloss) {
  if (!stat || !winloss) return null;
  const total = stat.total_trades;
  const winRate = winloss["win rate"];
  if (!total || winRate == null) return null;
  const wins = Math.round(winRate * total);
  const losses = total - wins;
  const grossProfit = (stat["average win"] ?? 0) * wins;
  const grossLoss = Math.abs(stat["average_loss"] ?? 0) * losses;
  if (grossLoss === 0) return null;
  return grossProfit / grossLoss;
}

// Simplified, non-annualized return/risk ratio — mean forward return divided
// by its standard deviation. Not a true Sharpe ratio (no risk-free rate, no
// annualization), so label it accordingly wherever it's shown.
export function computeReturnRiskRatio(stat) {
  if (!stat) return null;
  const mean = stat["10 candles forward return mean"];
  const std = stat["10 candles forward return std"];
  if (mean == null || !std) return null;
  return mean / std;
}

// p-value → significance verdict at the given alpha (default 0.05 / 95%).
export function testVerdict(pValue, alpha = 0.05) {
  if (pValue === undefined || pValue === null || Number.isNaN(pValue)) return null;
  const significant = pValue < alpha;
  return {
    significant,
    label: significant ? "SIG" : "NON-SIG",
    confidence: `${((1 - pValue) * 100).toFixed(1)}%`,
  };
}

export function relativeChange(base, filtered) {
  if (base === undefined || base === null || base === 0) return null;
  if (filtered === undefined || filtered === null) return null;
  return (filtered - base) / Math.abs(base);
}