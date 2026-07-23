import { Link, NavLink } from "react-router-dom";
import { LayoutGrid, Settings } from "lucide-react";
import { NAV_LINKS } from "./Navbar";

/**
 * Desktop-only sidebar nav. Hidden below lg — the app relies on the shared
 * top Navbar + MobileTabBar for smaller screens instead.
 */
export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#080b14] px-4 py-6 lg:flex">
      <Link to="/" className="flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/20 text-blue-400">
          <LayoutGrid size={16} />
        </span>
        <span className="text-base font-semibold tracking-tight text-white">
          QuantLab
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_LINKS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-blue-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label.toUpperCase()}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          QE
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white">
            Quant Engineer
          </div>
          <div className="text-[10px] text-slate-500">Local session</div>
        </div>
        <Settings size={14} className="flex-shrink-0 text-slate-500" />
      </div>
    </aside>
  );
}