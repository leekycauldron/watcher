import { NavLink, useLocation } from "react-router-dom";
import GlassSlider from "./GlassSlider";

const NAV_ITEMS = [
  { key: "/", to: "/", label: "Live", icon: "◉" },
  { key: "/events", to: "/events", label: "Events", icon: "▤" },
  { key: "/zones", to: "/zones", label: "Zones", icon: "⬡" },
  { key: "/rules", to: "/rules", label: "Rules", icon: "⚙" },
  { key: "/settings", to: "/settings", label: "Settings", icon: "☰" },
];

export default function BottomNav() {
  const location = useLocation();
  const activeKey = NAV_ITEMS.find((i) => i.to === location.pathname)?.key ?? "/";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-hud-surface/95 backdrop-blur-md border-t border-hud-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative flex justify-around items-center h-14">
        <GlassSlider items={NAV_ITEMS} activeKey={activeKey} />
        {/* Overlay actual navigation links */}
        <div className="absolute inset-0 flex justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 transition-colors ${
                  isActive ? "text-hud-cyan" : "text-hud-text-dim"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
