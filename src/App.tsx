import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  Play,
  Square,
  History,
  BarChart2,
  Settings,
  Home,
  Plus,
  X,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Download,
  Upload,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  Moon,
} from "lucide-react";
import { RouterProvider, useRouter } from "./lib/RouterContext";
import { CurrentTaskBanner } from "./components/CurrentTaskBanner";
import { HomeView } from "./pages/HomeView";
import { HistoryView } from "./pages/HistoryView";
import { HistoryDetailView } from "./pages/HistoryDetailsView";
import { AnalyticsView } from "./pages/AnalyticsView";
import { SettingsView } from "./pages/SettingsView";
import { ToastProvider } from "./lib/ToastContext";
import { AppProvider } from "./lib/AppContext";
import { Sidebar } from "./components/Sidebar";

// --- Features & Views ---

// --- Route Views ---

// --- Layout Wrapper ---

const AppShell = () => {
  const { currentPath } = useRouter();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      <Sidebar />
      <main className="flex-1 flex flex-col pb-20 md:pb-0 h-screen overflow-y-auto">
        <CurrentTaskBanner />
        <div className="flex-1">
          {currentPath === "/" && <HomeView />}
          {currentPath === "/history" && <HistoryView />}
          {currentPath === "/history/detail" && <HistoryDetailView />}
          {currentPath === "/analytics" && <AnalyticsView />}
          {currentPath === "/settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <RouterProvider>
          <AppShell />
        </RouterProvider>
      </AppProvider>
    </ToastProvider>
  );
}
