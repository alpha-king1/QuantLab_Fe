import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./Navbar";

export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#0b0f1a]/95 backdrop-blur md:hidden">
      {NAV_LINKS.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
              isActive ? "text-blue-400" : "text-slate-500"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActive ? "bg-blue-500/20" : ""
                }`}
              >
                <Icon size={16} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}