import { NavLink } from "react-router-dom";
import StatusIndicator from "../hud/StatusIndicator";

const NAV_ITEMS = [
  { to: "/", label: "Live", icon: "◉" },
  { to: "/events", label: "Events", icon: "▤" },
  { to: "/zones", label: "Zones", icon: "⬡" },
  { to: "/rules", label: "Rules", icon: "⚙" },
  { to: "/settings", label: "Settings", icon: "☰" },
];

interface SidebarProps {
  streamConnected: boolean;
}

export default function Sidebar({ streamConnected }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 hover:w-52 transition-all duration-300 bg-hud-surface border-r border-hud-border flex flex-col z-40 group overflow-hidden">
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-hud-border shrink-0">
        <span className="text-hud-cyan font-mono text-lg font-bold">W</span>
        <span className="text-hud-cyan font-mono text-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          ATCHER
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 py-3 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? "bg-hud-cyan/10 text-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                  : "text-hud-text-dim hover:text-hud-text hover:bg-white/5"
              }`
            }
          >
            <span className="w-8 text-center text-base shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Status widget */}
      <div className="px-3 py-3 border-t border-hud-border shrink-0">
        <div className="flex items-center gap-2">
          <StatusIndicator
            status={streamConnected ? "healthy" : "critical"}
            size="sm"
          />
          <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-hud-text-dim">
            {streamConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </aside>
  );
}
