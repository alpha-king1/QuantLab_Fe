import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Info,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";
import { useAnalysis } from "../context/AnalysisContext ";

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                        */
/* -------------------------------------------------------------------------- */

function pct(value, decimals = 2) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

function signedPct(value, decimals = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const v = value * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}

function money(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function shortDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/*  Derived-metric helpers — every value here is computed straight from       */
/*  the JSON your backend returns, nothing is hard-coded or invented.         */
/* -------------------------------------------------------------------------- */

// Running peak-to-trough drawdown from an equity curve, as a negative fraction.
function computeMaxDrawdown(equity) {
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
function computeProfitFactor(stat, winloss) {
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

function yearsSpan(equity) {
  if (!equity || equity.length < 2) return null;
  const first = new Date(equity[0].time);
  const last = new Date(equity[equity.length - 1].time);
  return (last - first) / (1000 * 60 * 60 * 24 * 365.25);
}

const RANGE_DAYS = { "1D": 1, "1W": 7, "1M": 30, ALL: Infinity };

function filterByRange(equity, range) {
  if (!equity || equity.length === 0) return [];
  if (range === "ALL") return equity;
  const lastTime = new Date(equity[equity.length - 1].time).getTime();
  const cutoff = lastTime - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
  const filtered = equity.filter((p) => new Date(p.time).getTime() >= cutoff);
  return filtered.length >= 2 ? filtered : equity.slice(-Math.min(5, equity.length));
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function InfoTip({ text }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label="More info"
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-amber-300 focus:text-amber-300 focus:outline-none"
      >
        <Info size={12} />
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-2 text-[11px] font-normal normal-case leading-relaxed text-slate-300 opacity-0 shadow-lg shadow-black/50 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

function Card({ title, value, icon: Icon, accent, sub, info }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between">
        <span className="flex items-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {title}
          {info && <InfoTip text={info} />}
        </span>
        {Icon && <Icon size={16} className={accent ?? "text-slate-500"} />}
      </div>
      <div className={`mt-2 text-2xl font-bold ${accent ?? "text-white"}`}>
        {value ?? "N/A"}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function RangeToggle({ range, setRange }) {
  return (
    <div className="flex gap-1 rounded-md border border-white/10 bg-black/30 p-1">
      {Object.keys(RANGE_DAYS).map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            range === r
              ? "bg-amber-500 text-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/**
 * Lightweight dependency-free SVG line chart. Each series is drawn on a
 * shared time/value scale so multiple curves stay comparable.
 */
function EquityChart({ series, height = 260 }) {
  const width = 1000;
  const allPoints = series.flatMap((s) => s.points);

  if (allPoints.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-500"
        style={{ height }}
      >
        Not enough data points in this range.
      </div>
    );
  }

  const times = allPoints.map((p) => new Date(p.time).getTime());
  const balances = allPoints.map((p) => p.balance);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances);

  const toPoints = (points) =>
    points
      .map((p) => {
        const t = new Date(p.time).getTime();
        const x = maxTime === minTime ? 0 : ((t - minTime) / (maxTime - minTime)) * width;
        const y =
          maxBal === minBal
            ? height / 2
            : height - ((p.balance - minBal) / (maxBal - minBal)) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={0}
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {series.map((s) => (
        <polyline
          key={s.label}
          points={toPoints(s.points)}
          fill="none"
          stroke={s.color}
          strokeWidth={s.strokeWidth ?? 2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function Overview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [range, setRange] = useState("ALL");
  const { result: ctxResult, meta: ctxMeta } = useAnalysis();

  const result = location.state?.result ?? ctxResult;
  const meta = location.state?.meta ?? ctxMeta;

  const data = useMemo(() => (Array.isArray(result) ? result : result ? [result] : []), [result]);

  const statsSection = data.find((item) => item.stats)?.stats;
  const performanceSection = data.find((item) => item.performance)?.performance;
  const tradeEvaluation = data.find((item) => item.trade_evaluation)?.trade_evaluation;
  const modelFiltered = data.find((item) => item.model_filtered)?.model_filtered;

  const originalStats = statsSection?.stat;
  const originalWinloss = performanceSection?.winloss;
  const volRegime = performanceSection?.vol_regime_strength?.[0];
  const yearlyStability = performanceSection?.yearly_stability;

  const filteredStats = modelFiltered?.stats?.stat;
  const filteredWinloss = modelFiltered?.performance?.winloss;
  const filteredEquity = modelFiltered?.trade_evaluation?.equity;

  const baselineEquity = tradeEvaluation?.equity;

  const maxDDBaseline = useMemo(() => computeMaxDrawdown(baselineEquity), [baselineEquity]);
  const maxDDFiltered = useMemo(() => computeMaxDrawdown(filteredEquity), [filteredEquity]);
  const profitFactorBaseline = useMemo(
    () => computeProfitFactor(originalStats, originalWinloss),
    [originalStats, originalWinloss]
  );
  const span = useMemo(() => yearsSpan(baselineEquity), [baselineEquity]);

  const filteredBaselineSeries = useMemo(
    () => filterByRange(baselineEquity, range),
    [baselineEquity, range]
  );
  const filteredMLSeries = useMemo(
    () => filterByRange(filteredEquity, range),
    [filteredEquity, range]
  );

  const winRateChange =
    originalWinloss?.["win rate"] && filteredWinloss?.["win rate"]
      ? (filteredWinloss["win rate"] - originalWinloss["win rate"]) / originalWinloss["win rate"]
      : null;

  const dominantRegime = useMemo(() => {
    if (!volRegime || volRegime.length === 0) return null;
    return volRegime.reduce((a, b) => (b.mean_diff > a.mean_diff ? b : a));
  }, [volRegime]);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center text-slate-300">
        <h2 className="text-xl font-bold text-white">No analysis found</h2>
        <p className="mt-2 text-sm text-slate-400">Run an analysis first.</p>
        <button
          onClick={() => navigate("/analysis")}
          className="mt-6 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Back to Analysis
        </button>
      </div>
    );
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quantlab-analysis-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const breakdownRows = [
    { label: "Total Trades", base: originalStats?.total_trades, filt: filteredStats?.total_trades, format: (v) => v ?? "—" },
    { label: "Win Rate", base: originalWinloss?.["win rate"], filt: filteredWinloss?.["win rate"], format: (v) => pct(v) },
    { label: "Mean Return", base: originalStats?.["10 candles forward return mean"], filt: filteredStats?.["10 candles forward return mean"], format: (v) => pct(v, 3) },
    { label: "Avg Win", base: originalStats?.["average win"], filt: filteredStats?.["average win"], format: (v) => pct(v, 3) },
    { label: "Avg Loss", base: originalStats?.["average_loss"], filt: filteredStats?.["average_loss"], format: (v) => pct(v, 3) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 antialiased">
      <Navbar avatar />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          {/* Desktop context bar */}
          <div className="mb-6 hidden items-center justify-between border-b border-white/10 pb-5 lg:flex">
            <div className="flex items-center gap-8 text-xs">
              <div>
                <div className="font-semibold uppercase tracking-widest text-slate-500">
                  Active Strategy
                </div>
                <div className="mt-1 font-semibold text-white">{meta?.strategy || "—"}</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-widest text-slate-500">
                  Asset Pair
                </div>
                <div className="mt-1 font-semibold text-white">{meta?.pair || "—"}</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-widest text-slate-500">
                  Timeframe
                </div>
                <div className="mt-1 font-semibold text-white">{meta?.timeframe || "—"}</div>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              <Download size={14} /> Export Report
            </button>
          </div>

          {/* Mobile-only strategy header */}
          <div className="mb-6 lg:hidden">
            <h1 className="text-lg font-bold text-white">
              {meta?.strategy || "Strategy"}{" "}
              <span className="font-normal text-slate-500">/ {meta?.pair || "—"}</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Period: {shortDate(baselineEquity?.[0]?.time)} to{" "}
              {shortDate(baselineEquity?.[baselineEquity.length - 1]?.time)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                {modelFiltered ? "ML Ready" : "Baseline Only"}
              </span>
              {span && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  {span.toFixed(1)}Y Data
                </span>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigate("/analysis")}
                className="rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400"
              >
                New Analysis
              </button>
            </div>
          </div>

          {/* Alpha impact + risk profile */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {modelFiltered && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
                <span className="flex items-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Alpha Impact Report
                  <InfoTip text="Shows how filtering trades with the ML model changed your win rate compared to the original strategy." />
                </span>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white sm:text-3xl">
                      Win Rate {signedPct(winRateChange)}
                    </div>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                      ML filtering changed win rate from {pct(originalWinloss?.["win rate"], 1)}{" "}
                      to {pct(filteredWinloss?.["win rate"], 1)} across{" "}
                      {filteredStats?.total_trades ?? "—"} filtered trades (down from{" "}
                      {originalStats?.total_trades ?? "—"}).
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="rounded-md border border-white/10 bg-black/30 px-4 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Before</div>
                      <div className="text-lg font-bold text-slate-300">
                        {pct(originalWinloss?.["win rate"], 1)}
                      </div>
                    </div>
                    <div className="rounded-md border border-amber-400 bg-amber-500/20 px-4 py-2 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-amber-200">After</div>
                      <div className="text-lg font-bold text-white">
                        {pct(filteredWinloss?.["win rate"], 1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex items-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Risk Profile
                <InfoTip text="Key risk indicators for this strategy — how much you could lose along the way, and how efficiently it makes money relative to losses." />
              </span>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="flex items-center text-slate-400">
                      Max Drawdown
                      <InfoTip text="The biggest drop from a peak to a low point in your account balance during the test period — the worst-case pain of holding this strategy." />
                    </span>
                    <span className="font-semibold text-red-400">{signedPct(maxDDBaseline)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${Math.min(Math.abs((maxDDBaseline ?? 0) * 100 * 5), 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="flex items-center text-slate-400">
                      Profit Factor
                      <InfoTip text="How much money was made for every dollar lost. Above 1 means the strategy was profitable overall — higher is better." />
                    </span>
                    <span className="font-semibold text-slate-200">
                      {profitFactorBaseline ? profitFactorBaseline.toFixed(2) : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.min((profitFactorBaseline ?? 0) * 40, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equity curve comparison */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  Equity Curve {modelFiltered ? "Comparison" : ""}
                </h2>
                <div className="mt-1 flex gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-500" /> Baseline Strategy
                  </span>
                  {modelFiltered && (
                    <span className="flex items-center gap-1.5 text-amber-200">
                      <span className="h-2 w-2 rounded-full bg-amber-300" /> ML Filtered
                    </span>
                  )}
                </div>
              </div>
              <RangeToggle range={range} setRange={setRange} />
            </div>
            <div className="mt-5 h-56 sm:h-72">
              <EquityChart
                series={[
                  { label: "Baseline", color: "#64748b", points: filteredBaselineSeries },
                  ...(modelFiltered
                    ? [{ label: "ML Filtered", color: "#fbbf24", strokeWidth: 2.5, points: filteredMLSeries }]
                    : []),
                ]}
              />
            </div>
          </div>

          {/* Quick stat cards */}
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card
              title="Total Trades"
              value={originalStats?.total_trades}
              info="The number of trades this strategy would have placed during the test period."
            />
            <Card
              title="Avg Win"
              value={money((originalStats?.["average win"] ?? 0) * (tradeEvaluation?.capital ?? 0))}
              icon={TrendingUp}
              accent="text-emerald-400"
              info="The average amount gained on trades that were profitable."
            />
            <Card
              title="Avg Loss"
              value={money((originalStats?.["average_loss"] ?? 0) * (tradeEvaluation?.capital ?? 0))}
              icon={TrendingDown}
              accent="text-red-400"
              info="The average amount lost on trades that weren't profitable."
            />
            <Card
              title="Net Liquidation Value"
              value={money(tradeEvaluation?.balance)}
              icon={Wallet}
              info="What your account would be worth if you cashed out today — starting capital plus total gains and losses."
              sub={
                tradeEvaluation
                  ? `${signedPct((tradeEvaluation.balance - tradeEvaluation.capital) / tradeEvaluation.capital)} ROA`
                  : null
              }
            />
          </div>

          {/* Volatility regime strength */}
          {volRegime && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Volatility Regime Strength
                  <InfoTip text="Shows which market conditions — calm or turbulent — this strategy performed best in." />
                </span>
                {dominantRegime && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    {dominantRegime.vol_regime} Vol Edge Strongest
                  </span>
                )}
              </div>
              <div className="mt-5 flex h-28 items-end gap-4">
                {volRegime.map((r) => {
                  const maxDiff = Math.max(...volRegime.map((x) => Math.abs(x.mean_diff)));
                  const heightPct = maxDiff > 0 ? (Math.abs(r.mean_diff) / maxDiff) * 100 : 0;
                  return (
                    <div key={r.vol_regime} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-20 w-full items-end">
                        <div
                          className={`w-full rounded-t-sm ${
                            r.mean_diff >= 0 ? "bg-amber-400/60" : "bg-red-500/50"
                          }`}
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {r.vol_regime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yearly stability map */}
          {yearlyStability && yearlyStability.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex items-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Yearly Stability Map
                <InfoTip text="A year-by-year heatmap showing whether this strategy's edge held up consistently over time, or was inconsistent." />
              </span>
              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5">
                {(() => {
                  const maxAbs = Math.max(...yearlyStability.map((y) => Math.abs(y.mean_diff)));
                  return yearlyStability.map((y) => {
                    const intensity = maxAbs > 0 ? Math.abs(y.mean_diff) / maxAbs : 0;
                    const bg =
                      y.mean_diff >= 0
                        ? `rgba(96, 165, 250, ${0.15 + intensity * 0.65})`
                        : `rgba(248, 113, 113, ${0.15 + intensity * 0.65})`;
                    return (
                      <div
                        key={y.year}
                        title={`${y.year}: ${signedPct(y.mean_diff, 3)} vs baseline, n=${y.sample_size}`}
                        className="flex aspect-square flex-col items-center justify-center rounded-md text-[10px] font-semibold text-white"
                        style={{ backgroundColor: bg }}
                      >
                        {y.year}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>Period Heatmap</span>
                <span className="flex items-center gap-1.5">
                  Low Alpha
                  <span className="h-2 w-2 rounded-full bg-amber-300/30" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/70" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  High Alpha
                </span>
              </div>
            </div>
          )}

          {/* Strategy breakdown table */}
          {modelFiltered && (
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="p-5 pb-0">
                <h2 className="flex items-center text-sm font-semibold text-white sm:text-base">
                  Strategy Breakdown: Performance vs. ML Layer
                  <InfoTip text="A side-by-side comparison of the original strategy's key metrics against the same metrics after ML filtering was applied." />
                </h2>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-t border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-3 font-semibold">Metric</th>
                      <th className="px-5 py-3 font-semibold">Baseline</th>
                      <th className="px-5 py-3 font-semibold">ML Filtered</th>
                      <th className="px-5 py-3 font-semibold">
                        <span className="inline-flex items-center">
                          Variance
                          <InfoTip text="The percentage change between the baseline result and the ML-filtered result." />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownRows.map((row) => {
                      const variance =
                        row.base && row.base !== 0 ? (row.filt - row.base) / Math.abs(row.base) : null;
                      return (
                        <tr key={row.label} className="border-t border-white/5">
                          <td className="px-5 py-3 text-slate-300">{row.label}</td>
                          <td className="px-5 py-3 font-mono text-slate-300">{row.format(row.base)}</td>
                          <td className="px-5 py-3 font-mono text-amber-200">{row.format(row.filt)}</td>
                          <td
                            className={`px-5 py-3 font-mono ${
                              variance == null ? "text-slate-500" : variance >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {variance == null ? "—" : signedPct(variance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom nav — desktop only, mobile uses the tab bar */}
          <div className="mt-6 hidden gap-3 lg:flex">
            <button
              onClick={() => navigate("/statistics", { state: { result, meta } })}
              className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              View Statistics <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/machine-learning", { state: { result, meta } })}
              className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              View Machine Learning <ArrowRight size={14} />
            </button>
          </div>
        </main>

      <MobileTabBar />
    </div>
  );
}

export default Overview;