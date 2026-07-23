import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  BarChart3,
  BrainCircuit,
  LayoutGrid,
  ArrowRight,
  Check,
  Mail,
  Code2,
  Users,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";

/* -------------------------------------------------------------------------- */
/*  Static content                                                            */
/* -------------------------------------------------------------------------- */

const HERO_STATS = [
  { value: "12.4ms", label: "Latency" },
  { value: "1.84", label: "Sharpe Ratio" },
  { value: "99.8%", label: "Val Validation" },
  { value: "450+", label: "Factors" },
];

const ARCHITECTURE_CARDS = [
  {
    icon: LineChart,
    tag: "Real-Time",
    title: "Strategic Analysis",
    desc: "Vectorized backtesting engine capable of processing 10-year historical data across 500+ assets in seconds.",
    span: "md:col-span-1",
    bars: [40, 55, 30, 65, 90, 50, 70],
  },
  {
    icon: BarChart3,
    tag: "Historical",
    title: "Statistical Validation",
    desc: "Rigorous hypothesis testing, including Monte Carlo simulations and walk-forward analysis.",
    span: "md:col-span-1",
    footer: ["P-VAL", "T-STAT", "Z-SCORE"],
  },
  {
    icon: BrainCircuit,
    tag: "Neural",
    title: "ML Alpha Filtering",
    desc: "Neural networks trained to identify trade quality and filter low-probability execution signals.",
    span: "md:col-span-1",
  },
];

const SECONDARY_CARDS = [
  {
    title: "Regime Monitoring",
    desc: "Real-time tracking of equity curves and strategy drift relative to current market volatility regimes.",
    meters: [
      { label: "Drawdown Limit", value: 12.5, display: "12.5%" },
      { label: "Stability Score", value: 82, display: "0.82" },
    ],
  },
  {
    title: "Execution Engine",
    status: "Live Status: Normal",
    rows: [
      { label: "Protocol", value: "FIX / FAST 4.4" },
      { label: "Concurrency", value: "Async-IO Polling" },
      { label: "Storage", value: "Parquet / Dask-Dist" },
    ],
  },
];

const CHECKLIST = [
  {
    title: "Custom Strategy Development",
    desc: "Translation of complex discretionary ideas into robust algorithmic execution.",
  },
  {
    title: "ML Model Integration",
    desc: "Deployment of XGBoost, LSTM, and Transformer models for signal filtering.",
  },
  {
    title: "Proprietary Research Tools",
    desc: "Development of custom visualization dashboards and backtesting environments.",
  },
];

const CONTACT_CARDS = [
  { icon: Mail, label: "Email", value: "research@quantlab.io" },
  { icon: Code2, label: "GitHub", value: "@quantlab-dev" },
  { icon: Users, label: "LinkedIn", value: "/in/quantlab" },
];

const INQUIRY_TYPES = [
  "Custom Strategy Dev",
  "ML Model Integration",
  "Research Collaboration",
  "General Inquiry",
];

/* -------------------------------------------------------------------------- */
/*  Reusable bits                                                             */
/* -------------------------------------------------------------------------- */

function SectionEyebrow({ children }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="h-px w-6 bg-blue-500/70" />
      <span className="text-xs font-semibold tracking-[0.2em] text-blue-400">
        {children}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiry: INQUIRY_TYPES[0],
    brief: "",
  });

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to your backend / mail service.
    console.log("Inquiry submitted:", form);
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200 antialiased">
      <Navbar action={{ label: "Launch Analysis", to: "/analysis" }} />

      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Quantitative Strategy Research
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            &amp; ML Alpha Filtering
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Transform raw tick data and historical order flows into
          mathematically verified alpha. Leverage high-density backtesting
          engines and machine learning refinement to mitigate overfitting and
          capture regime-specific edges.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/analysis"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Explore Engine <ArrowRight size={16} />
          </Link>
          <a
            href="#collaboration"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
          >
            Documentation
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          {HERO_STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-xl font-bold text-white sm:text-2xl">
                {value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Core architecture                                                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionEyebrow>Core Architecture</SectionEyebrow>
        <p className="text-sm text-slate-400 sm:text-base">
          Modular subsystems designed for institutional-grade reliability.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ARCHITECTURE_CARDS.map(({ icon: Icon, tag, title, desc, bars, footer }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-blue-400">
                  <Icon size={18} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {tag}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {desc}
              </p>

              {bars && (
                <div className="mt-5 flex h-16 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-blue-500/40"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}

              {footer && (
                <div className="mt-6 flex gap-4 border-t border-white/10 pt-3 text-[10px] font-semibold tracking-wide text-slate-500">
                  {footer.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Regime monitoring */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-blue-400">
              <LayoutGrid size={18} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-white">
              {SECONDARY_CARDS[0].title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {SECONDARY_CARDS[0].desc}
            </p>

            <div className="mt-5 space-y-4">
              {SECONDARY_CARDS[0].meters.map(({ label, value, display }) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{label}</span>
                    <span className="text-slate-300">{display}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution engine */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {SECONDARY_CARDS[1].title}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                {SECONDARY_CARDS[1].status}
              </span>
            </div>
            <div className="mt-5 divide-y divide-white/10 text-xs">
              {SECONDARY_CARDS[1].rows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Trading ecosystem                                                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Custom Solutions
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
              Build Your Proprietary
              <br />
              Trading Ecosystem
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              As a specialized quantitative developer, I offer end-to-end
              strategy engineering — from low-latency data pipelines to
              sophisticated ML-driven alpha discovery modules.
            </p>

            <ul className="mt-6 space-y-5">
              {CHECKLIST.map(({ title, desc }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {title}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 via-[#0b1224] to-blue-950">
              <div className="grid w-4/5 grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex h-24 flex-col justify-end gap-1 rounded-md border border-white/10 bg-black/30 p-2 sm:h-32"
                  >
                    <svg viewBox="0 0 60 24" className="h-8 w-full text-blue-400">
                      <polyline
                        points="0,20 10,14 20,16 30,8 40,10 50,4 60,6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-blue-300">
                <BrainCircuit size={16} />
              </span>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400">
                  Chief Quant Dev
                </div>
                <div className="text-xs font-semibold text-white">
                  Alexander Reed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Collaboration / contact                                          */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="collaboration"
        className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Initiate Collaboration
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Have a specific strategy or research bottleneck? Let's engineer a
          solution.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONTACT_CARDS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left"
            >
              <Icon size={16} className="text-blue-400" />
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-200">
                {value}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Name / Firm
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Full Name or Entity"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Contact Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="email@address.com"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Inquiry Type
            </label>
            <div className="relative">
              <select
                value={form.inquiry}
                onChange={handleChange("inquiry")}
                className="w-full appearance-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Project Brief
            </label>
            <textarea
              rows={4}
              value={form.brief}
              onChange={handleChange("brief")}
              placeholder="Describe your strategy requirements or research goals..."
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Send Transmission
          </button>
        </form>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-white/10 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LayoutGrid size={14} />
            <span>© 2026 QuantLab Research Systems</span>
          </div>
          <div className="flex gap-5 text-xs text-slate-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>SLA</span>
          </div>
        </div>
      </footer>

      <MobileTabBar />
    </div>
  );
}