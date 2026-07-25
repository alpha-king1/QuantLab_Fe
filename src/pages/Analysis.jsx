import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext ";
import {
  getTradingPairs,
  getStrategies,
  getTimeframes,
  analyseStrategy,
} from "../api/api";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";
import { Wallet, Zap, AlertCircle, Info, TerminalSquare } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// Rough candle-count estimate for the info line under the form.
// Supports common shorthand like "1m", "15m", "1h", "4h", "1d".
function estimateCandleCount(startDate, endDate, timeframe) {
  if (!startDate || !endDate || !timeframe) return null;

  const match = String(timeframe).trim().match(/^(\d+)\s*([mhd])$/i);
  if (!match) return null;

  const [, amountStr, unit] = match;
  const amount = Number(amountStr);
  const unitMinutes = { m: 1, h: 60, d: 60 * 24 }[unit.toLowerCase()];
  if (!unitMinutes) return null;

  const intervalMs = amount * unitMinutes * 60 * 1000;
  const rangeMs = new Date(endDate) - new Date(startDate);
  if (!(rangeMs > 0) || !(intervalMs > 0)) return null;

  return Math.floor(rangeMs / intervalMs);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function SelectField({ id, label, value, onChange, disabled, placeholder, options, getKey, getValue, getLabel }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={getKey(item)} value={getValue(item)}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function Analysis() {
  // API data
  const [tradingPairs, setTradingPairs] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [timeframes, setTimeframes] = useState([]);

  // Form data
  const [strategy, setStrategy] = useState("");
  const [pair, setPair] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capital, setCapital] = useState("");

  // UI states
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");
  const [optionsLoadedAt, setOptionsLoadedAt] = useState(null);
  const navigate = useNavigate();
  const { setAnalysis, options, setOptions } = useAnalysis();
  
  useEffect(() => {
    async function loadOptions() {
      // Already cached this session — skip the network calls entirely.
      if (options) {
        setTradingPairs(options.tradingPairs);
        setStrategies(options.strategies);
        setTimeframes(options.timeframes);
        setOptionsLoadedAt(new Date());
        if (options.strategies.length > 0) setStrategy(options.strategies[0].id);
        if (options.tradingPairs.length > 0) setPair(options.tradingPairs[0]);
        if (options.timeframes.length > 0) setTimeframe(options.timeframes[0]);
        setLoadingOptions(false);
        return;
      }

      try {
        setLoadingOptions(true);
        setError("");

        const [pairsData, strategiesData, timeframesData] = await Promise.all([
          getTradingPairs(),
          getStrategies(),
          getTimeframes(),
        ]);

        setTradingPairs(pairsData);
        setStrategies(strategiesData);
        setTimeframes(timeframesData);
        setOptionsLoadedAt(new Date());
        setOptions({ tradingPairs: pairsData, strategies: strategiesData, timeframes: timeframesData });

        if (strategiesData.length > 0) setStrategy(strategiesData[0].id);
        if (pairsData.length > 0) setPair(pairsData[0]);
        if (timeframesData.length > 0) setTimeframe(timeframesData[0]);
      } catch (err) {
        console.error(err);
        setError("Unable to load analysis options. Make sure the backend is running.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!strategy || !pair || !timeframe || !startDate || !endDate || !capital) {
      setError("Please fill in all fields.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    if (Number(capital) <= 0) {
      setError("Capital must be greater than zero.");
      return;
    }

    const payload = {
      strategy,
      pair,
      timeframe,
      start_date: startDate,
      end_date: endDate,
      capital: Number(capital),
    };

    try {
      setLoadingAnalysis(true);
      console.log("Sending analysis request:", payload);

      const result = await analyseStrategy(payload);
      console.log("Analysis result:", result);

      if (result) {
        const meta = {
          strategy: selectedStrategyName || strategy,
          pair,
          timeframe,
          startDate,
          endDate,
          capital: Number(capital),
        };
        setAnalysis(result, meta);
        navigate("/overview", { state: { result, meta } });
      }
      console.log("Analysis completed successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  const selectedStrategyName = useMemo(
    () => strategies.find((s) => s.id === strategy)?.name ?? "",
    [strategies, strategy]
  );

  const estimatedCandles = useMemo(
    () => estimateCandleCount(startDate, endDate, timeframe),
    [startDate, endDate, timeframe]
  );

  // Only offer the segmented-button layout when there's a small, sane number
  // of timeframe options — otherwise fall back to a normal dropdown.
  const useSegmentedTimeframe = timeframes.length > 0 && timeframes.length <= 6;

  if (loadingOptions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        Loading QuantLab...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 antialiased">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-300">
            QUANTLAB
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Analyse a <span className="text-amber-300">Trading Strategy</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Configure your market data and strategy parameters to run a
            quantitative analysis.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form + summary layout: side-by-side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:col-span-3"
          >
            <SelectField
              id="strategy"
              label="Strategy Architecture"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={loadingAnalysis}
              placeholder="Select a strategy"
              options={strategies}
              getKey={(s) => s.id}
              getValue={(s) => s.id}
              getLabel={(s) => s.name}
            />

            <SelectField
              id="pair"
              label="Trading Pair Instrument"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              disabled={loadingAnalysis}
              placeholder="Select a trading pair"
              options={tradingPairs}
              getKey={(p) => p}
              getValue={(p) => p}
              getLabel={(p) => p}
            />

            {/* Analysis resolution */}
            <div>
              <FieldLabel>Analysis Resolution</FieldLabel>
              {useSegmentedTimeframe ? (
                <div className="grid grid-cols-4 gap-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      disabled={loadingAnalysis}
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-md border px-2 py-2 text-xs font-semibold uppercase transition-colors disabled:opacity-50 ${
                        timeframe === tf
                          ? "border-amber-400 bg-amber-400/20 text-amber-200"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  disabled={loadingAnalysis}
                  className="w-full appearance-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select timeframe</option>
                  {timeframes.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Capital */}
            <div>
              <FieldLabel>Initial Capital (USD)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  $
                </span>
                <input
                  id="capital"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="100,000.00"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  disabled={loadingAnalysis}
                  className="w-full rounded-md border border-white/10 bg-black/30 py-2.5 pl-7 pr-9 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none disabled:opacity-50"
                />
                <Wallet
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            {/* Simulation window */}
            <div>
              <FieldLabel>Simulation Window</FieldLabel>
              <div className="space-y-2">
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loadingAnalysis}
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
                />
                <div className="flex items-center gap-3 py-0.5">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Through
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loadingAnalysis}
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {estimatedCandles !== null && (
              <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-xs italic leading-relaxed text-slate-500">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  Backtest will simulate approximately{" "}
                  {estimatedCandles.toLocaleString()} candle intervals.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingAnalysis}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-3 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {loadingAnalysis ? "Running Analysis..." : "Run Analysis"}
              {!loadingAnalysis && <Zap size={16} />}
            </button>
          </form>

          {/* Right column: config summary + diagnostics */}
          <div className="space-y-6 lg:col-span-2">
            {/* Configuration summary — reflects your actual selections,
                nothing here is fabricated performance data. */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold text-white">
                Configuration Summary
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {selectedStrategyName
                  ? `"${selectedStrategyName}" will be evaluated against ${pair || "—"} on the ${timeframe || "—"} resolution across your selected window.`
                  : "Select a strategy to see a summary of your configuration."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Pair", value: pair || "—" },
                  { label: "Resolution", value: timeframe || "—" },
                  {
                    label: "Capital",
                    value: capital ? `$${Number(capital).toLocaleString()}` : "—",
                  },
                ].map(({ label, value }) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {label}: <span className="text-slate-200">{value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* System diagnostics — reflects real load state, not fake logs */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 font-mono">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <TerminalSquare size={14} />
                System Diagnostics
              </div>
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <p className="text-slate-500">
                  [{optionsLoadedAt ? formatTime(optionsLoadedAt) : "--:--:--"}]{" "}
                  <span className="text-emerald-400">Options loaded</span> —
                  strategies: {strategies.length}, pairs: {tradingPairs.length},
                  timeframes: {timeframes.length}
                </p>
                <p className="text-slate-500">
                  [{formatTime(new Date())}]{" "}
                  {loadingAnalysis ? (
                    <span className="text-amber-300">Analysis in progress…</span>
                  ) : (
                    <span className="text-slate-400">Awaiting submission</span>
                  )}
                </p>
                {error && (
                  <p className="text-red-400">
                    [{formatTime(new Date())}] Error — {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
}

export default Analysis;