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
  Sparkles,
  Activity,
  Network,
  TrendingUp,
  TrendingDown,
  BarChart2,
  FileText,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import MobileTabBar from "../components/layout/MobileTabBar";

/* -------------------------------------------------------------------------- */
/*  Static content                                                            */
/* -------------------------------------------------------------------------- */

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Define",
    tag: "Parameter Inputs",
    desc: "Hypothesis formulation and factor selection based on market anomalies.",
  },
  {
    num: "02",
    title: "Research",
    tag: "Backtest Execution",
    desc: "Data ingestion and cross-asset correlation mapping.",
  },
  {
    num: "03",
    title: "Analyze",
    tag: "Equity Metrics",
    desc: "Factor attribution and backtesting on high-fidelity tick data.",
  },
  {
    num: "04",
    title: "Validate",
    tag: "Statistical Tests",
    desc: "Out-of-sample testing and Monte Carlo stress simulations.",
  },
  {
    num: "05",
    title: "Evaluate ML",
    tag: "Signal Quality",
    desc: "Hyper-parameter tuning and ensemble model training.",
  },
  {
    num: "06",
    title: "Filter",
    tag: "Alpha Selection",
    desc: "Neural alpha filtering to reduce drawdown and volatility noise.",
    active: true,
  },
];

const CAPABILITIES = [
  {
    icon: LineChart,
    title: "Strategy Research",
    desc: "High-fidelity backtesting engine across diversified timeframes and instruments.",
  },
  {
    icon: BarChart3,
    title: "Statistical Validation",
    desc: "Robustness testing using KS, Mann-Whitney, and T-Tests to confirm edge significance.",
  },
  {
    icon: Activity,
    title: "Performance Analysis",
    desc: "Deep dive into trade dynamics: MAE/MFE distributions and drawdown profiles.",
  },
  {
    icon: Network,
    title: "Machine Learning",
    desc: "Feature-based model comparisons to predict trade outcomes with probabilistic precision.",
  },
  {
    icon: Sparkles,
    title: "ML-Filtered Results",
    desc: "The unique QuantLab story: removing noise to keep only high-conviction signals.",
  },
];

const LOOK_BEYOND_METRICS = [
  { metric: "Forward Returns", label: "30D Proj." },
  { metric: "Exposure", label: "MAE" },
  { metric: "Exposure", label: "MFE" },
  { metric: "Validity", label: "Stat Tests" },
  { metric: "Consistency", label: "Yearly Stability" },
  { metric: "Environment", label: "Volatility Regimes" },
];

const RISK_METRICS = [
  {
    icon: TrendingDown,
    label: "MAE (Mean Adverse Excursion)",
    value: "0.42%",
    tone: "text-rose-400",
  },
  {
    icon: TrendingUp,
    label: "MFE (Mean Favorable Excursion)",
    value: "1.84%",
    tone: "text-emerald-400",
  },
  {
    icon: BarChart2,
    label: "Forward Returns (30D Proj.)",
    value: "+4.12%",
    tone: "text-amber-300",
  },
];

const MODEL_COMPARISON = [
  { name: "Gradient Boosted Forest", acc: 84.2 },
  { name: "Deep Neural Network", acc: 79.8 },
  { name: "Logistic Regression (Baseline)", acc: 61.2 },
];

const FEATURE_IMPORTANCE = [
  { name: "VIX Basis Correlation", value: 42 },
  { name: "Skew Delta Volume", value: 28 },
  { name: "Momentum Decay Factor", value: 18 },
  { name: "Liquidity Fragmentation", value: 12 },
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
  {
    icon: Mail,
    label: "Email",
    value: "oduyebojohn123@gmail.com",
    href: "mailto:oduyebojohn123@gmail.com",
  },
  {
    icon: Code2,
    label: "GitHub",
    value: "@alpha-king1",
    href: "https://github.com/alpha-king1",
  },
  {
    icon: Users,
    label: "LinkedIn",
    value: "/in/john-oduyebo",
    href: "https://www.linkedin.com/in/john-oduyebo-514923213/",
  },
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
      <span className="h-px w-6 bg-amber-400/70" />
      <span className="text-xs font-semibold tracking-[0.2em] text-amber-300">
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
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("https://formspree.io/f/mnjeonjv", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          projectScope: form.inquiry,
          message: form.brief,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", inquiry: INQUIRY_TYPES[0], brief: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 antialiased">
      <Navbar action={{ label: "Launch Analysis", to: "/analysis" }} />

      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Quantitative Research.
          <br />
          <span className="bg-gradient-to-r from-amber-300 to-yellow-100 bg-clip-text text-transparent">
            Built Around Evidence.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Rigorously test strategies against granular historical data.
          Analyze performance metrics, validate through statistical
          inference, and refine edges with advanced ML alpha filtering.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/analysis"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Launch Analysis <ArrowRight size={16} />
          </Link>
          <a
            href="#papers"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
          >
            <FileText size={16} /> Research Papers
          </a>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Scientific workflow                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Scientific Workflow
          </h2>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="mt-10 space-y-8 md:hidden">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.num} className="relative flex gap-4">
              {i !== WORKFLOW_STEPS.length - 1 && (
                <span className="absolute left-4 top-9 h-[calc(100%+0.5rem)] w-px bg-white/10" />
              )}
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.active
                    ? "bg-amber-400 text-black"
                    : "border border-white/15 bg-white/5 text-slate-400"
                }`}
              >
                {step.num}
              </span>
              <div className="pb-2">
                <div className="text-sm font-semibold text-white">
                  {step.title}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">
                  {step.tag}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: horizontal stepper */}
        <div className="mt-12 hidden md:block">
          <div className="grid grid-cols-6 gap-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i !== WORKFLOW_STEPS.length - 1 && (
                  <span className="absolute left-1/2 top-5 h-px w-full -translate-x-0 bg-white/10" />
                )}
                <span
                  className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                    step.active
                      ? "bg-amber-400 text-black"
                      : "border border-white/15 bg-[#0a0a0a] text-slate-400"
                  }`}
                >
                  {step.num}
                </span>
                <div className="mt-3 text-sm font-semibold text-white">
                  {step.title}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                  {step.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Research laboratory capabilities                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionEyebrow>
            <span className="mx-auto">Research Laboratory Capabilities</span>
          </SectionEyebrow>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-amber-300">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Look beyond profitability + risk metrics                          */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Look Beyond Profitability
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Traditional metrics lie. We look at the underlying mechanics of
            every trade.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LOOK_BEYOND_METRICS.map(({ metric, label }, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
                {metric}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-200">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RISK_METRICS.map(({ icon: Icon, label, value, tone }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {label}
                </div>
                <div className={`mt-1 text-lg font-bold ${tone}`}>
                  {value}
                </div>
              </div>
              <Icon size={20} className={tone} />
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Model comparison + feature importance                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-300" />
              <h3 className="text-sm font-semibold text-white">
                Model Comparison
              </h3>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">
                Validation Set: 30%
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {MODEL_COMPARISON.map(({ name, acc }) => (
                <div key={name}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{name}</span>
                    <span className="font-semibold text-white">
                      {acc}% Acc
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <LayoutGrid size={16} className="text-amber-300" />
              <h3 className="text-sm font-semibold text-white">
                Neural Feature Importance
              </h3>
            </div>
            <div className="mt-5 space-y-4">
              {FEATURE_IMPORTANCE.map(({ name, value }) => (
                <div key={name}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{name}</span>
                    <span className="font-semibold text-white">
                      {value}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-yellow-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Alpha filtering impact                                            */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <SectionEyebrow>
          <span className="mx-auto">Alpha Filtering Impact</span>
        </SectionEyebrow>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Original Strategy
            </div>
            <div className="mt-2 flex items-end gap-1.5">
              {[40, 55, 30, 65, 90, 50, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-4 rounded-sm bg-slate-600"
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
            <div className="mt-4 text-xl font-bold text-rose-400">
              SR 1.2
            </div>
          </div>
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-6 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">
              ML Filtered
            </div>
            <div className="mt-2 flex items-end gap-1.5">
              {[60, 75, 55, 85, 100, 78, 92].map((h, i) => (
                <div
                  key={i}
                  className="w-4 rounded-sm bg-amber-300"
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
            <div className="mt-4 text-xl font-bold text-amber-300">
              SR 2.8
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-xs italic text-slate-500">
          Neural Core filtering reduces volatility and improves Sharpe Ratio
          by ~133%.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Does ML improve trade selection                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Does ML Improve Trade Selection?
        </h2>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Raw Strategy
            </div>
            <div className="mt-2 text-3xl font-bold text-white">15</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Trades
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-300">
              66.7% Win Rate
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < 10 ? "bg-amber-400" : "bg-rose-500/70"
                  }`}
                />
              ))}
            </div>
          </div>

          <ArrowRight size={20} className="hidden text-slate-600 sm:block" />

          <div className="w-full max-w-xs rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-6">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">
              ML-Filtered
            </div>
            <div className="mt-2 text-3xl font-bold text-white">11</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Trades
            </div>
            <div className="mt-1 text-sm font-semibold text-amber-200">
              90.9% Win Rate
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {Array.from({ length: 11 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < 10 ? "bg-amber-300" : "bg-rose-500/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-slate-500">
          By identifying the statistical "dead zones" where historical
          trades failed, the ML layer filters out 4 losing trades,
          drastically increasing the quality of capital deployment.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA                                                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to Research a Strategy?
        </h2>
        <div className="mt-6">
          <Link
            to="/analysis"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Launch Analysis <ArrowRight size={16} />
          </Link>
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
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
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
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 via-[#15100a] to-amber-950">
              <div className="grid w-4/5 grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex h-24 flex-col justify-end gap-1 rounded-md border border-white/10 bg-black/30 p-2 sm:h-32"
                  >
                    <svg viewBox="0 0 60 24" className="h-8 w-full text-amber-300">
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/30 text-amber-200">
                <BrainCircuit size={16} />
              </span>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400">
                  Chief Quant Dev
                </div>
                <div className="text-xs font-semibold text-white">
                  John
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
          {CONTACT_CARDS.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              {...(href.startsWith("mailto:")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-amber-400/40 hover:bg-white/[0.05]"
            >
              <Icon size={16} className="text-amber-300" />
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-200 transition-colors group-hover:text-amber-300">
                {value}
              </div>
            </a>
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
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
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
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Project Scope
            </label>
            <div className="relative">
              <select
                value={form.inquiry}
                onChange={handleChange("inquiry")}
                className="w-full appearance-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
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
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 w-full rounded-md bg-amber-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send Transmission"}
          </button>

          {status === "success" && (
            <p className="mt-3 text-center text-xs font-semibold text-emerald-400">
              Message sent — I'll get back to you shortly.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-center text-xs font-semibold text-red-400">
              Something went wrong. Please try again or email me directly.
            </p>
          )}
        </form>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-white/10 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LayoutGrid size={14} />
            <span>© 2026 QuantLab Systems Inc. — Lantau Island, Hong Kong Research Center</span>
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