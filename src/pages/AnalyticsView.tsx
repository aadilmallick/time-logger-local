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
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
} from "../components/UIComponents";
import { TimelineView } from "../components/TimelineView";
import { formatDuration } from "../lib/utils";
import { CategoryBarChart, RingChart } from "../components/Analytics";
import { EntryList } from "../components/EntryList";
import { AddEntryModal } from "../components/AddEntryModal";
import { useRouter } from "../lib/RouterContext";
import type { TimeLog } from "../types";
import { db } from "../lib/DB";

export const AnalyticsView = () => {
  const { categories } = useAppStore();
  const [logs, setLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    db.getAllTimeLogs().then(setLogs);
  }, []);

  const allEntries = useMemo(() => logs.flatMap((l) => l.entries), [logs]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalDead = 0;
    logs.forEach((l) => {
      totalDead += AnalyticsEngine.calculateDeadTime(l.entries);
    });
    return AnalyticsEngine.computeStats(allEntries, totalDead);
  }, [allEntries, logs]);

  const avgDailyTracked =
    logs.length > 0 ? stats.intentionalTime / logs.length : 0;

  const topCategoryEntry = Object.entries(stats.byCategory).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topCategory = topCategoryEntry
    ? categories.find((c) => c.id === topCategoryEntry[0])
    : null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Insights across all tracked time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Tracked Time
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatDuration(stats.intentionalTime)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Dead Time
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatDuration(stats.deadTimeMinutes)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Avg. Daily Tracked
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatDuration(avgDailyTracked)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Longest Task
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatDuration(stats.longestTask)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-6">
            Time by Category
          </h3>
          <CategoryBarChart data={stats.byCategory} categories={categories} />
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 self-start mb-auto">
            Overall Productivity
          </h3>
          {allEntries.length > 0 ? (
            <div className="my-auto transform scale-150">
              <RingChart
                percentage={stats.prodPercent}
                label="Focus Score"
                color="#8b5cf6"
              />
            </div>
          ) : (
            <p className="text-slate-500 my-auto">No data to display</p>
          )}
          <div className="mt-auto self-start pt-8">
            {topCategory && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Most time spent on:{" "}
                <Badge color={topCategory.color}>{topCategory.name}</Badge> (
                {formatDuration(topCategoryEntry[1])})
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
