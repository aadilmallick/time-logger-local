import { useEffect, useState } from "react";
import { useAppStore } from "../lib/AppContext";
import { calculateDuration, formatDuration, formatTime } from "../lib/utils";
import { Square } from "lucide-react";
import { Button, Badge } from "./UIComponents";

export const CurrentTaskBanner = () => {
  const { currentTask, endTask, categories } = useAppStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!currentTask) return;
    const interval = setInterval(() => {
      setElapsed(
        calculateDuration(currentTask.startTime, new Date().toISOString()),
      );
    }, 1000); // Check every sec, though we display minutes. 1000ms makes it responsive if we added seconds.
    return () => clearInterval(interval);
  }, [currentTask]);

  if (!currentTask) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No active task running.
      </div>
    );
  }

  const cat = categories.find((c) => c.id === currentTask.categoryId);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50 px-4 py-3 sticky top-0 z-30 shadow-sm backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {currentTask.taskName}
            </h2>
            {cat && <Badge color={cat.color}>{cat.name}</Badge>}
          </div>
          {currentTask.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {currentTask.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col text-right">
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {formatDuration(Math.floor(elapsed))}
            </span>
            <span className="text-xs text-slate-500">
              Started at {formatTime(currentTask.startTime)}
            </span>
          </div>
          <Button
            variant="danger"
            onClick={endTask}
            className="whitespace-nowrap"
          >
            <Square className="w-4 h-4" /> Stop Task
          </Button>
        </div>
      </div>
    </div>
  );
};
