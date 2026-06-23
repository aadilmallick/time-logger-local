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
import { useAppStore } from "../lib/AppContext";
import { AnalyticsEngine } from "../lib/AnalyticsService";
import { Button, Card, Input, Label, Select } from "../components/UIComponents";
import { formatDuration } from "../lib/utils";
import { RingChart } from "../components/Analytics";
import type { TimeLog } from "../types";
import { useRouter } from "../lib/RouterContext";
import { db } from "../lib/DB";

export const HistoryView = () => {
  const { navigate } = useRouter();
  const [logs, setLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    db.getAllTimeLogs().then((data) => {
      // Sort desc
      setLogs(
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this entire log?")) {
      await db.deleteTimeLog(date);
      setLogs((prev) => prev.filter((l) => l.date !== date));
    }
  };

  // Group by month
  const grouped = logs.reduce(
    (acc, log) => {
      const month = new Date(log.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(log);
      return acc;
    },
    {} as Record<string, TimeLog[]>,
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          History
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review past logs and performance.
        </p>
      </header>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No historical data found.
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthLogs]) => (
          <div key={month} className="space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 pb-2 border-b dark:border-slate-800">
              {month}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthLogs.map((log) => {
                const deadTime = AnalyticsEngine.calculateDeadTime(log.entries);
                const stats = AnalyticsEngine.computeStats(
                  log.entries,
                  deadTime,
                );
                const displayDate = new Date(log.date).toLocaleDateString(
                  "en-US",
                  { weekday: "short", month: "short", day: "numeric" },
                );

                return (
                  <Card
                    key={log.id}
                    className="cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                  >
                    <div
                      onClick={() =>
                        navigate("/history/detail", { date: log.date })
                      }
                      className="p-5 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {displayDate}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {stats.taskCount} entries
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, log.date)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-500">
                            Tracked:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDuration(stats.intentionalTime)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Dead:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDuration(stats.deadTimeMinutes)}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12">
                          <RingChart percentage={stats.prodPercent} label="" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
