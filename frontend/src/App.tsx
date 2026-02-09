import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LiveView from "./pages/LiveView";
import EventHistory from "./pages/EventHistory";
import ZoneEditor from "./pages/ZoneEditor";
import RulesManager from "./pages/RulesManager";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LiveView />} />
        <Route path="events" element={<EventHistory />} />
        <Route path="zones" element={<ZoneEditor />} />
        <Route path="rules" element={<RulesManager />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
