// --- State Management (Context acting as Zustand) ---

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Category, TimeLog, CurrentTask, Entry } from "../types";
import { useToast } from "./ToastContext";
import {
  calculateDuration,
  checkOverlap,
  generateId,
  getLocalDateString,
} from "./utils";
import { db } from "./DB";

type AppState = {
  isInitialized: boolean;
  categories: Category[];
  todayLog: TimeLog | null;
  currentTask: CurrentTask | null;
  theme: "light" | "dark" | "system";
};

type AppContextType = AppState & {
  startTask: (task: Omit<CurrentTask, "startTime">) => void;
  endTask: () => void;
  addEntry: (
    entry: Omit<
      Entry,
      "id" | "createdAt" | "updatedAt" | "timeLogId" | "durationMinutes"
    >,
  ) => Promise<boolean>;
  updateEntry: (entry: Entry) => Promise<boolean>;
  deleteEntry: (entryId: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  updateCategory: (id: string, name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  setTheme: (theme: "light" | "dark" | "system") => void;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>({
    isInitialized: false,
    categories: [],
    todayLog: null,
    currentTask: null,
    theme: (localStorage.getItem("theme") as any) || "system",
  });
  const { showToast } = useToast();

  const handleMidnightCross = async (activeTask: CurrentTask) => {
    const startObj = new Date(activeTask.startTime);
    const startDayStr = getLocalDateString(startObj);
    const todayStr = getLocalDateString();

    if (startDayStr !== todayStr) {
      // End task at 23:59:59 of the start day
      const endOfStartDay = new Date(startObj);
      endOfStartDay.setHours(23, 59, 59, 999);

      let pastLog = await db.getTimeLog(startDayStr);
      if (!pastLog) {
        pastLog = {
          id: generateId(),
          date: startDayStr,
          entries: [],
          createdAt: new Date().toISOString(),
        };
      }

      const durationMinutes = calculateDuration(
        activeTask.startTime,
        endOfStartDay.toISOString(),
      );

      const newEntry: Entry = {
        id: generateId(),
        timeLogId: pastLog.id,
        taskName: activeTask.taskName,
        description: activeTask.description,
        categoryId: activeTask.categoryId,
        startTime: activeTask.startTime,
        endTime: endOfStartDay.toISOString(),
        durationMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      pastLog.entries.push(newEntry);
      pastLog.entries.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      await db.saveTimeLog(pastLog);

      localStorage.removeItem("currentTask");
      return true; // Indicates it was crossed and cleared
    }
    return false;
  };

  const init = useCallback(async () => {
    await db.init();

    // Check local storage for active task
    const savedTaskStr = localStorage.getItem("currentTask");
    let activeTask: CurrentTask | null = null;
    if (savedTaskStr) {
      try {
        activeTask = JSON.parse(savedTaskStr);
        if (activeTask && (await handleMidnightCross(activeTask))) {
          activeTask = null; // Task was closed out yesterday
        }
      } catch (e) {
        localStorage.removeItem("currentTask");
      }
    }

    const categories = await db.getCategories();
    const todayLog = await db.getOrCreateTodayLog();

    setState((prev) => ({
      ...prev,
      isInitialized: true,
      categories,
      todayLog,
      currentTask: activeTask,
    }));
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (state.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(state.theme);
    }
    localStorage.setItem("theme", state.theme);
  }, [state.theme]);

  const refreshData = async () => {
    const categories = await db.getCategories();
    const todayLog = await db.getOrCreateTodayLog();
    setState((prev) => ({ ...prev, categories, todayLog }));
  };

  const startTask = (task: Omit<CurrentTask, "startTime">) => {
    const newTask: CurrentTask = {
      ...task,
      startTime: new Date().toISOString(),
    };

    // Check overlap with existing today's entries
    if (state.todayLog) {
      if (
        checkOverlap(
          state.todayLog.entries,
          new Date(newTask.startTime),
          new Date(newTask.startTime),
        )
      ) {
        showToast("Cannot start task overlapping an existing entry.", "error");
        return;
      }
    }

    localStorage.setItem("currentTask", JSON.stringify(newTask));
    setState((prev) => ({ ...prev, currentTask: newTask }));
  };

  const endTask = async () => {
    if (!state.currentTask || !state.todayLog) return;

    const wasCrossed = await handleMidnightCross(state.currentTask);
    if (wasCrossed) {
      setState((prev) => ({ ...prev, currentTask: null }));
      await refreshData();
      return;
    }

    const endTime = new Date().toISOString();
    const durationMinutes = calculateDuration(
      state.currentTask.startTime,
      endTime,
    );

    if (durationMinutes <= 0) {
      showToast("Task duration is zero. Discarded.", "info");
      localStorage.removeItem("currentTask");
      setState((prev) => ({ ...prev, currentTask: null }));
      return;
    }

    const newEntry: Entry = {
      id: generateId(),
      timeLogId: state.todayLog.id,
      taskName: state.currentTask.taskName,
      description: state.currentTask.description,
      categoryId: state.currentTask.categoryId,
      startTime: state.currentTask.startTime,
      endTime,
      durationMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (
      checkOverlap(
        state.todayLog.entries,
        new Date(newEntry.startTime),
        new Date(newEntry.endTime),
      )
    ) {
      showToast(
        "Task overlaps with an existing entry! Please edit manually.",
        "error",
      );
      return;
    }

    const updatedLog = {
      ...state.todayLog,
      entries: [...state.todayLog.entries, newEntry],
    };
    updatedLog.entries.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    await db.saveTimeLog(updatedLog);
    localStorage.removeItem("currentTask");

    setState((prev) => ({ ...prev, currentTask: null, todayLog: updatedLog }));
    showToast("Task completed.", "success");
  };

  const addEntry = async (
    entryData: Omit<
      Entry,
      "id" | "createdAt" | "updatedAt" | "timeLogId" | "durationMinutes"
    >,
  ) => {
    if (!state.todayLog) return false;

    const start = new Date(entryData.startTime);
    const end = new Date(entryData.endTime);

    if (end <= start) {
      showToast("End time must be after start time.", "error");
      return false;
    }

    if (checkOverlap(state.todayLog.entries, start, end)) {
      showToast("Entry overlaps with an existing task.", "error");
      return false;
    }

    if (state.currentTask && new Date(state.currentTask.startTime) < end) {
      showToast("Entry overlaps with the currently running task.", "error");
      return false;
    }

    const newEntry: Entry = {
      ...entryData,
      id: generateId(),
      timeLogId: state.todayLog.id,
      durationMinutes: calculateDuration(
        entryData.startTime,
        entryData.endTime,
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedLog = {
      ...state.todayLog,
      entries: [...state.todayLog.entries, newEntry],
    };
    updatedLog.entries.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    await db.saveTimeLog(updatedLog);
    setState((prev) => ({ ...prev, todayLog: updatedLog }));
    showToast("Entry added.", "success");
    return true;
  };

  const updateEntry = async (entry: Entry) => {
    if (!state.todayLog) return false;

    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime);

    if (end <= start) {
      showToast("End time must be after start time.", "error");
      return false;
    }

    if (checkOverlap(state.todayLog.entries, start, end, entry.id)) {
      showToast("Modified times overlap with another entry.", "error");
      return false;
    }

    const updatedLog = {
      ...state.todayLog,
      entries: state.todayLog.entries.map((e) =>
        e.id === entry.id
          ? {
              ...entry,
              durationMinutes: calculateDuration(
                entry.startTime,
                entry.endTime,
              ),
              updatedAt: new Date().toISOString(),
            }
          : e,
      ),
    };
    updatedLog.entries.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    await db.saveTimeLog(updatedLog);
    setState((prev) => ({ ...prev, todayLog: updatedLog }));
    showToast("Entry updated.", "success");
    return true;
  };

  const deleteEntry = async (entryId: string) => {
    if (!state.todayLog) return;
    const updatedLog = {
      ...state.todayLog,
      entries: state.todayLog.entries.filter((e) => e.id !== entryId),
    };
    await db.saveTimeLog(updatedLog);
    setState((prev) => ({ ...prev, todayLog: updatedLog }));
    showToast("Entry deleted.", "info");
  };

  const addCategory = async (name: string, color: string) => {
    const newCat: Category = {
      id: generateId(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    await db.saveCategory(newCat);
    await refreshData();
    showToast("Category added.", "success");
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    const existing = state.categories.find((c) => c.id === id);
    if (!existing) return;

    const updatedCat: Category = {
      ...existing,
      name,
      color,
    };
    await db.saveCategory(updatedCat);
    await refreshData();
    showToast("Category updated.", "success");
  };

  const deleteCategory = async (id: string) => {
    if (id === "no-category") return;

    await db.deleteCategory(id);

    // Migration: Update all time logs
    const allLogs = await db.getAllTimeLogs();
    for (const log of allLogs) {
      let modified = false;
      const updatedEntries = log.entries.map((entry) => {
        if (entry.categoryId === id) {
          modified = true;
          return { ...entry, categoryId: "no-category" };
        }
        return entry;
      });

      if (modified) {
        await db.saveTimeLog({ ...log, entries: updatedEntries });
      }
    }

    // Migration: Update current task
    if (state.currentTask?.categoryId === id) {
      const updatedTask = { ...state.currentTask, categoryId: "no-category" };
      localStorage.setItem("currentTask", JSON.stringify(updatedTask));
      setState((prev) => ({ ...prev, currentTask: updatedTask }));
    }

    await refreshData();
    showToast("Category deleted and entries migrated.", "info");
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    setState((prev) => ({ ...prev, theme }));
  };

  if (!state.isInitialized)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
        Loading workspace...
      </div>
    );

  return (
    <AppContext.Provider
      value={{
        ...state,
        startTask,
        endTask,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// export const useAppStore = () => {
//   const ctx = useContext(AppContext);
//   if (!ctx) throw new Error("useAppStore must be used within AppProvider");
//   return ctx;
// };
