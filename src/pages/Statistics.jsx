import { useLocation, useNavigate } from "react-router-dom";
import { Download, RefreshCcw, ArrowLeft } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";
import { useAnalysis } from "../context/AnalysisContext ";
import { pct, num, testVerdict } from "../utils/metrics";

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

function Card({ title, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </div>
      <div className={`mt-2 text-xl font-bold ${accent ?? "text-white"}`}>
        {value ?? "N/A"}
      </div>
    </div>
  );
}

function TestRow({ label, sub, pValue }) {
  const verdict = testVerdict(pValue);
  return (
    <div className="flex items-center justify-between border-t border-white/5 py-3 first:border-t-0">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-slate-300">{num(pValue, 4)}</span>
        {verdict && (
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              verdict.significant
                ? "bg-blue-500/20 text-blue-300"
                : "bg-white/10 text-slate-400"
            }`}
          >
            {verdict.significant ? `SIG (${verdict.confidence})` : "NON-SIG"}
          </span>
        )}
      </div>
    </div>
  );
}

// Five-number-summary "box plot" built from real min/25%/50%/75%/max fields —
// there's no raw per-trade distribution in the payload, so this (not a fake
// histogram) is the honest way to show distribution shape.
function DistributionBox({ title, sub, data, tone }) {
  if (!data) return null;
  const { min, "25%": q1, "50%": q2, "75%": q3, max, mean } = data;
  const range = max - min || 1;
  const pos = (v) => ((v - min) / range) * 100;

  const barColor = tone === "danger" ? "bg-red-400/60" : "bg-blue-400/60";
  const dotColor = tone === "danger" ? "bg-red-400" : "bg-blue-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {sub}
        </span>
      </div>

      <div className="relative mt-8 h-2 rounded-full bg-white/10">
        <div
          className={`absolute h-2 rounded-full ${barColor}`}
          style={{ left: `${pos(q1)}%`, width: `${pos(q3) - pos(q1)}%` }}
        />
        <div
          className={`absolute -top-1.5 h-5 w-0.5 ${dotColor}`}
          style={{ left: `${pos(q2)}%` }}
        />
        <div
          className={`absolute -top-1 h-4 w-1 rounded-full bg-white`}
          style={{ left: `calc(${pos(mean)}% - 2px)` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-y-3 text-center sm:grid-cols-6">
        {[
          ["MIN", min],
          ["Q1", q1],
          ["MEAN", mean],
          ["Q2", q2],
          ["Q3", q3],
          ["MAX", max],
        ].map(([label, v]) => (
          <div key={label}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </div>
            <div className={`text-sm font-mono ${label === "MEAN" ? "text-white" : "text-slate-300"}`}>
              {pct(v, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ data, columns, labels }) {
  if (!data || data.length === 0) {
    return <p className="p-5 text-xs text-slate-500">No data available.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-t border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
            {columns.map((c, i) => (
              <th key={c} className="whitespace-nowrap px-5 py-3 font-semibold">
                {labels?.[i] ?? c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-white/5">
              {columns.map((c) => {
                const v = row[c];
                const isMeanDiff = c === "mean_diff" || c === "structure_mean" || c === "baseline_mean";
                return (
                  <td key={c} className="whitespace-nowrap px-5 py-3 font-mono text-slate-300">
                    {typeof v === "number" ? (isMeanDiff ? pct(v, 3) : v.toLocaleString()) : v ?? "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function Statistics() {
  const location = useLocation();
  const navigate = useNavigate();

  const { result: ctxResult, meta: ctxMeta } = useAnalysis();
  const result = location.state?.result ?? ctxResult;
  const meta = location.state?.meta ?? ctxMeta;

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b14] px-4 text-center text-slate-300">
        <h2 className="text-xl font-bold text-white">No analysis found</h2>
        <p className="mt-2 text-sm text-slate-400">Run an analysis first.</p>
        <button
          onClick={() => navigate("/analysis")}
          className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Back to Analysis
        </button>
      </div>
    );
  }

  const data = Array.isArray(result) ? result : [result];

  const statsSection = data.find((item) => item.stats)?.stats;
  const performanceSection = data.find((item) => item.performance)?.performance;
  const modelFiltered = data.find((item) => item.model_filtered)?.model_filtered;

  const stat = statsSection?.stat;
  const statisticalTests = statsSection?.statistical_test;
  const yearlyStability = performanceSection?.yearly_stability || [];
  const volatility = (performanceSection?.vol_regime_strength || []).flat();

  const filteredStat = modelFiltered?.stats?.stat;
  const filteredTests = modelFiltered?.stats?.statistical_test;

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200 antialiased">
      <Navbar avatar />

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-400">
              STRATEGY ANALYSIS
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Statistical Validation
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Comprehensive quantitative performance metrics
              {meta?.strategy ? ` for ${meta.strategy}` : ""}.
            </p>
            {stat?.total_trades && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  Sample Size: {stat.total_trades} Trades
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  α = 0.05 (95% Confidence)
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              <Download size={14} /> Export PDF
            </button>
            <button
              onClick={() => navigate("/analysis")}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <RefreshCcw size={14} /> Run New Analysis
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/overview", { state: { result, meta } })}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={13} /> Back to Overview
        </button>

        {/* Return statistics + hypothesis tests */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-white">Return Statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card title="Mean Return" value={pct(stat?.["10 candles forward return mean"], 3)} accent="text-blue-300" />
              <Card title="Median Return" value={pct(stat?.["10 candles forward return median"], 3)} />
              <Card title="Std Deviation" value={pct(stat?.["10 candles forward return std"], 2)} />
              <Card title="Skewness" value={num(stat?.["10 candles forward return skew"], 3)} />
              <Card title="Avg Win" value={pct(stat?.["average win"], 3)} accent="text-emerald-400" />
              <Card title="Avg Loss" value={pct(stat?.["average_loss"], 3)} accent="text-red-400" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">Hypothesis Tests</h2>
            <div className="mt-2">
              <TestRow label="KS2 Test" sub="Distribution Normality" pValue={statisticalTests?.["ks2_test results"]} />
              <TestRow label="Mann-Whitney U" sub="Pre vs Post Structural" pValue={statisticalTests?.["MW_test result"]} />
              <TestRow label="T-Test (1-sample)" sub="Zero Mean Null" pValue={statisticalTests?.["ttest result"]} />
              <div className="flex items-center justify-between border-t border-white/5 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">Bootstrap Resampling</div>
                  <div className="text-[11px] text-slate-500">Mean Diff (not a p-value)</div>
                </div>
                <span className="font-mono text-sm text-slate-300">
                  {pct(statisticalTests?.["bootstrap resampling result"], 4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAE / MFE distributions */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DistributionBox
            title="Maximum Adverse Excursion (MAE)"
            sub="Entry-to-Low"
            data={stat?.MAE}
            tone="danger"
          />
          <DistributionBox
            title="Maximum Favorable Excursion (MFE)"
            sub="Entry-to-High"
            data={stat?.MFE}
          />
        </div>

        {stat?.MAE?.mean && stat?.MFE?.mean && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Card title="Avg MAE" value={pct(stat.MAE.mean, 2)} accent="text-red-400" />
            <Card title="Avg MFE" value={pct(stat.MFE.mean, 2)} accent="text-emerald-400" />
            <Card
              title="Ratio (MFE / MAE)"
              value={stat.MAE.mean !== 0 ? Math.abs(stat.MFE.mean / stat.MAE.mean).toFixed(2) : "—"}
            />
          </div>
        )}

        {/* Yearly stability */}
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <h2 className="p-5 pb-0 text-sm font-semibold text-white">Yearly Performance Stability</h2>
          <DataTable
            data={yearlyStability}
            columns={["year", "structure_mean", "baseline_mean", "mean_diff", "sample_size"]}
            labels={["Year", "Structure Mean", "Baseline Mean", "Mean Diff", "Sample Size"]}
          />
        </div>

        {/* Volatility regime breakdown */}
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <h2 className="p-5 pb-0 text-sm font-semibold text-white">Volatility Regime Breakdown</h2>
          <DataTable
            data={volatility}
            columns={["vol_regime", "structure_mean", "baseline_mean", "mean_diff", "sample_size"]}
            labels={["Vol Regime", "Structure Mean", "Baseline Mean", "Mean Diff", "Sample Size"]}
          />
        </div>

        {/* Post-ML sections */}
        {filteredStat && (
          <>
            <div className="mt-8 border-t border-white/10 pt-6">
              <span className="text-xs font-semibold tracking-[0.2em] text-blue-400">
                POST-ML FILTER
              </span>
              <h2 className="mt-1 text-lg font-bold text-white">Filtered Strategy Statistics</h2>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card title="Filtered Trades" value={filteredStat.total_trades} />
              <Card title="Filtered Return Mean" value={pct(filteredStat["10 candles forward return mean"], 3)} accent="text-blue-300" />
              <Card title="Filtered Avg Win" value={pct(filteredStat["average win"], 3)} accent="text-emerald-400" />
              <Card title="Filtered Avg Loss" value={pct(filteredStat["average_loss"], 3)} accent="text-red-400" />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">Post-ML Hypothesis Tests</h3>
              <div className="mt-2">
                <TestRow label="KS2 Test" sub="Distribution Normality" pValue={filteredTests?.["ks2_test results"]} />
                <TestRow label="Mann-Whitney U" sub="Pre vs Post Structural" pValue={filteredTests?.["MW_test result"]} />
                <TestRow label="T-Test (1-sample)" sub="Zero Mean Null" pValue={filteredTests?.["ttest result"]} />
                <div className="flex items-center justify-between border-t border-white/5 py-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Bootstrap Resampling</div>
                    <div className="text-[11px] text-slate-500">Mean Diff (not a p-value)</div>
                  </div>
                  <span className="font-mono text-sm text-slate-300">
                    {pct(filteredTests?.["bootstrap resampling result"], 4)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <MobileTabBar />
    </div>
  );
}

export default Statistics;