import { useRouter } from "../lib/RouterContext";
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

export const Sidebar = () => {
  const { currentPath, navigate } = useRouter();

  const navItems = [
    { path: "/", label: "Today", icon: Home },
    { path: "/history", label: "History", icon: History },
    { path: "/analytics", label: "Analytics", icon: BarChart2 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen p-4">
        <div className="flex items-center gap-2 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            TimeLog
          </span>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (currentPath.startsWith("/history") && item.path === "/history");
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (currentPath.startsWith("/history") && item.path === "/history");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path as any)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 text-[10px] font-medium transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
