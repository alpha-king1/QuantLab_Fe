import { Link, NavLink } from "react-router-dom";
import { LayoutGrid, LineChart, BarChart3, BrainCircuit } from "lucide-react";

export const NAV_LINKS = [
  { label: "Home", to: "/", icon: LineChart },
  { label: "Analysis", to: "/analysis", icon: LineChart },
  { label: "Overview", to: "/overview", icon: LayoutGrid },
  { label: "Stats", to: "/statistics", icon: BarChart3 },
  { label: "ML", to: "/machine-learning", icon: BrainCircuit },
];

function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
    </span>
  );
}

/**
 * Shared top navbar. Pass `action` ({ label, to }) to render an optional
 * primary button on the right (desktop only), e.g. "Launch Analysis" on Home.
 * Pass `avatar` to show a small initials circle on the right (desktop only).
 */
export default function Navbar({ action, avatar }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-300">
            <LayoutGrid size={16} />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            QuantLab
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-xs font-semibold tracking-[0.15em] transition-colors ${
                  isActive
                    ? "border border-white/10 bg-white/10 text-amber-200"
                    : "text-slate-400 hover:text-white"
                }`
              }
            >
              {label.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* <LivePulse /> */}
          {action && (
            <Link
              to={action.to}
              className="hidden items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-400 md:inline-flex"
            >
              {action.label}
            </Link>
          )}
          {avatar && (
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black md:inline-flex">
              QL
            </span>
          )}
        </div>
      </div>
    </header>
  );
}