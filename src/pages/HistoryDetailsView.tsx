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
import { TimelineView } from "../components/TimelineView";
import { formatDuration } from "../lib/utils";
import { RingChart } from "../components/Analytics";
import { EntryList } from "../components/EntryList";
import { AddEntryModal } from "../components/AddEntryModal";
import { useRouter } from "../lib/RouterContext";
import type { TimeLog } from "../types";
import { db } from "../lib/DB";

export const HistoryDetailView = () => {
  const { params, navigate } = useRouter();
  const [log, setLog] = useState<TimeLog | null>(null);

  useEffect(() => {
    if (params.date) {
      db.getTimeLog(params.date).then((data) => setLog(data || null));
    }
  }, [params.date]);

  if (!log)
    return <div className="p-8 text-center text-slate-500">Loading log...</div>;

  const deadTime = AnalyticsEngine.calculateDeadTime(log.entries);
  const stats = AnalyticsEngine.computeStats(log.entries, deadTime);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/history")}
          className="!px-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            {new Date(log.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Read-only historical view
          </p>
        </div>
      </header>

      <section className="space-y-4 pt-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Timeline
        </h3>
        <div className="pt-6">
          <TimelineView entries={log.entries} activeTask={null} />
        </div>
      </section>

      {stats.taskCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm text-slate-500 mb-1">
              Intentional Time
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatDuration(stats.intentionalTime)}
            </span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm text-slate-500 mb-1">Dead Time</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatDuration(stats.deadTimeMinutes)}
            </span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center col-span-2 md:col-span-2">
            <div className="flex items-center gap-4">
              <RingChart percentage={stats.prodPercent} label="Productivity" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-sm text-slate-500">Focus Score</span>
                <p className="text-xs text-slate-400 mt-1 max-w-[150px]">
                  Based on ratio of logged vs dead time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Logged Entries
        </h3>
        <EntryList entries={log.entries} isReadonly />
      </section>
    </div>
  );
};
