import { Outlet } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useStreamStatus } from "../../hooks/useStreamStatus";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { status } = useStreamStatus();

  return (
    <div className="h-dvh flex flex-col">
      {isDesktop && <Sidebar streamConnected={status?.connected ?? false} />}

      <main
        className={`flex-1 overflow-auto ${isDesktop ? "ml-16" : "pb-14"}`}
      >
        <Outlet />
      </main>

      {!isDesktop && <BottomNav />}
    </div>
  );
}
