import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";
import EquityChart from "../components/charts/EquityChart";
import { useAnalysis } from "../context/AnalysisContext ";
import {
  pct,
  num,
  money,
  signedPct,
  computeMaxDrawdown,
  computeProfitFactor,
  computeReturnRiskRatio,
  relativeChange,
} from "../utils/metrics";

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

function Card({ title, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </div>
      <div className={`mt-2 text-xl font-bold ${accent ?? "text-white"}`}>
        {value ?? "N/A"}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function DeltaCard({ title, baseValue, filteredValue, decimals = 2, invertGood = false }) {
  const change = relativeChange(baseValue, filteredValue);
  const improved = change == null ? null : invertGood ? change < 0 : change > 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold text-white">
          {filteredValue != null ? filteredValue.toFixed(decimals) : "—"}
        </span>
        {change != null && (
          <span
            className={`mb-1 flex items-center gap-0.5 text-xs font-semibold ${
              improved ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {improved ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {signedPct(change)}
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">
        vs baseline {baseValue != null ? baseValue.toFixed(decimals) : "—"}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function MachineLearning() {
  const location = useLocation();
  const navigate = useNavigate();

  const { result: ctxResult, meta: ctxMeta } = useAnalysis();
  const result = location.state?.result ?? ctxResult;
  const meta = location.state?.meta ?? ctxMeta;

  const data = useMemo(() => (Array.isArray(result) ? result : result ? [result] : []), [result]);

  // Only rendered if your backend actually returns this shape — it isn't
  // present in the sample payload, so this section stays hidden until it is.
  const modelStats = data.find((item) => item.model_stats)?.model_stats || [];

  const importance = data.find((item) => item.model_importance)?.model_importance || {};
  const modelFiltered = data.find((item) => item.model_filtered)?.model_filtered;

  const baselineStats = data.find((item) => item.stats)?.stats?.stat;
  const baselineWinloss = data.find((item) => item.performance)?.performance?.winloss;
  const baselineEquity = data.find((item) => item.trade_evaluation)?.trade_evaluation;

  const filteredStats = modelFiltered?.stats?.stat;
  const filteredPerformance = modelFiltered?.performance;
  const filteredEvaluation = modelFiltered?.trade_evaluation;

  const maxDDBase = useMemo(() => computeMaxDrawdown(baselineEquity?.equity), [baselineEquity]);
  const maxDDFiltered = useMemo(() => computeMaxDrawdown(filteredEvaluation?.equity), [filteredEvaluation]);
  const pfBase = useMemo(() => computeProfitFactor(baselineStats, baselineWinloss), [baselineStats, baselineWinloss]);
  const pfFiltered = useMemo(
    () => computeProfitFactor(filteredStats, filteredPerformance?.winloss),
    [filteredStats, filteredPerformance]
  );
  const rrBase = useMemo(() => computeReturnRiskRatio(baselineStats), [baselineStats]);
  const rrFiltered = useMemo(() => computeReturnRiskRatio(filteredStats), [filteredStats]);

  const sortedImportance = useMemo(
    () => Object.entries(importance).sort(([, a], [, b]) => b - a),
    [importance]
  );
  const maxImportance = sortedImportance[0]?.[1] || 1;

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

  function handleDownloadCsv() {
    const rows = [["series", "time", "balance"]];
    (baselineEquity?.equity || []).forEach((p) => rows.push(["baseline", p.time, p.balance]));
    (filteredEvaluation?.equity || []).forEach((p) => rows.push(["ml_filtered", p.time, p.balance]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quantlab-equity-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tradesChange = relativeChange(baselineStats?.total_trades, filteredStats?.total_trades);
  const winRateChange = relativeChange(baselineWinloss?.["win rate"], filteredPerformance?.winloss?.["win rate"]);

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200 antialiased">
      <Navbar avatar />

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-400">
              QUANTITATIVE RESEARCH / ENGINE V4.2
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Machine Learning Analysis
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Model evaluation and strategy filtering
              {meta?.strategy ? ` for ${meta.strategy}` : ""}.
            </p>
          </div>
          <button
            onClick={() => navigate("/overview", { state: { result, meta } })}
            className="flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
          >
            <ArrowLeft size={14} /> Overview
          </button>
        </div>

        {/* Model performance matrix — only if your backend returns model_stats */}
        {modelStats.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <h2 className="p-5 pb-0 text-sm font-semibold text-white">Model Comparison</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-t border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3 font-semibold">Model</th>
                    <th className="px-5 py-3 font-semibold">Accuracy</th>
                    <th className="px-5 py-3 font-semibold">Precision</th>
                    <th className="px-5 py-3 font-semibold">Recall</th>
                    <th className="px-5 py-3 font-semibold">F1</th>
                    <th className="px-5 py-3 font-semibold">AUC-ROC</th>
                  </tr>
                </thead>
                <tbody>
                  {modelStats.map((m, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-5 py-3 font-semibold text-white">Model {i + 1}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{pct(m.accuracy)}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{pct(m.precision)}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{pct(m.recall)}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{pct(m.f1)}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{pct(m.auc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feature importance */}
        {sortedImportance.length > 0 && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">Feature Importance</h2>
            <div className="mt-4 space-y-3">
              {sortedImportance.map(([feature, value]) => (
                <div key={feature} className="grid grid-cols-[120px_1fr_60px] items-center gap-3 sm:grid-cols-[160px_1fr_70px]">
                  <span className="truncate text-xs font-medium text-slate-300">{feature}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${(value / maxImportance) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs text-slate-400">{num(value, 4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alpha filtering impact */}
        {modelFiltered && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">Alpha Filtering Impact</h2>
            <p className="mt-1 text-xs text-slate-400">
              Comparing original strategy equity against ML-filtered execution.
            </p>

            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Filtered Trades
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{filteredStats?.total_trades ?? "—"}</span>
                  {tradesChange != null && (
                    <span className="text-xs font-semibold text-red-400">{signedPct(tradesChange)}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Adjusted Win Rate
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">
                    {pct(filteredPerformance?.winloss?.["win rate"], 1)}
                  </span>
                  {winRateChange != null && (
                    <span className="text-xs font-semibold text-emerald-400">{signedPct(winRateChange)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> Original Strategy —{" "}
                {money(baselineEquity?.balance)}
              </span>
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> ML Filtered —{" "}
                {money(filteredEvaluation?.balance)}
              </span>
            </div>

            <div className="mt-3 h-48 sm:h-56">
              <EquityChart
                series={[
                  { label: "Baseline", color: "#64748b", points: baselineEquity?.equity || [] },
                  { label: "ML Filtered", color: "#60a5fa", strokeWidth: 2.5, points: filteredEvaluation?.equity || [] },
                ]}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DeltaCard title="Return / Risk Ratio*" baseValue={rrBase} filteredValue={rrFiltered} decimals={2} />
              <DeltaCard
                title="Max Drawdown"
                baseValue={maxDDBase != null ? maxDDBase * 100 : null}
                filteredValue={maxDDFiltered != null ? maxDDFiltered * 100 : null}
                decimals={1}
              />
              <DeltaCard title="Profit Factor" baseValue={pfBase} filteredValue={pfFiltered} decimals={2} />
            </div>
            <p className="mt-2 text-[10px] text-slate-600">
              *Simplified mean/std of forward returns — not an annualized, risk-free-adjusted Sharpe ratio.
            </p>
          </div>
        )}

        {/* Filtered equity summary */}
        {filteredEvaluation && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card title="Starting Capital" value={money(filteredEvaluation.capital)} />
            <Card title="Final Balance" value={money(filteredEvaluation.balance)} accent="text-blue-300" />
            <Card
              title="Return"
              value={signedPct((filteredEvaluation.balance - filteredEvaluation.capital) / filteredEvaluation.capital)}
              accent="text-emerald-400"
            />
          </div>
        )}

        <button
          onClick={handleDownloadCsv}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-white/15 py-3 text-xs font-semibold text-slate-200 hover:bg-white/5 sm:w-auto sm:px-6"
        >
          <Download size={14} /> Download Equity Data (.csv)
        </button>

        <button
          onClick={() => navigate("/statistics", { state: { result, meta } })}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={13} /> Statistics
        </button>
      </main>

      <MobileTabBar />
    </div>
  );
}

export default MachineLearning;