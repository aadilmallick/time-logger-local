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

export const HomeView = () => {
  const { currentTask, startTask, todayLog, categories } = useAppStore();
  const [taskName, setTaskName] = useState("");
  const [catId, setCatId] = useState("");
  const [desc, setDesc] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !catId) setCatId(categories[0].id);
  }, [categories, catId]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || currentTask) return;
    startTask({ taskName, categoryId: catId, description: desc });
    setTaskName("");
    setDesc("");
  };

  const deadTime = todayLog
    ? AnalyticsEngine.calculateDeadTime(todayLog.entries)
    : 0;
  const stats = todayLog
    ? AnalyticsEngine.computeStats(todayLog.entries, deadTime)
    : null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Today
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Quick Start Card */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <form
          onSubmit={handleStart}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full">
            <Label>What are you working on?</Label>
            <Input
              required
              value={taskName}
              onChange={(e: any) => setTaskName(e.target.value)}
              placeholder="e.g., Designing landing page..."
              disabled={!!currentTask}
            />
          </div>
          <div className="w-full md:w-48">
            <Label>Category</Label>
            <Select
              value={catId}
              onChange={(e: any) => setCatId(e.target.value)}
              disabled={!!currentTask}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="submit"
            disabled={!!currentTask || !taskName.trim()}
            className="w-full md:w-auto h-[42px]"
          >
            <Play className="w-4 h-4" /> Start Tracking
          </Button>
        </form>
      </Card>

      {/* Timeline */}
      <section className="space-y-4 pt-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" /> Daily Timeline
        </h3>
        <div className="pt-6">
          <TimelineView
            entries={todayLog?.entries || []}
            activeTask={currentTask}
          />
        </div>
      </section>

      {/* Stats Summary for Today */}
      {stats && stats.taskCount > 0 && (
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
                  Based on ratio of logged vs dead time today.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Entries List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Logged Entries
          </h3>
          <Button
            variant="secondary"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs py-1.5 h-auto"
          >
            <Plus className="w-3 h-3" /> Add Manually
          </Button>
        </div>
        <EntryList entries={todayLog?.entries || []} />
      </section>

      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
