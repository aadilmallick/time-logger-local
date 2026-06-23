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
import { useToast } from "../lib/ToastContext";

export const SettingsView = () => {
  const { theme, setTheme, refreshData, categories, addCategory } =
    useAppStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3b82f6");

  const handleExport = async () => {
    const logs = await db.getAllTimeLogs();
    const cats = await db.getCategories();
    const data = JSON.stringify({ timelogs: logs, categories: cats }, null, 2);

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timelog_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported successfully.", "success");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json.timelogs) || !Array.isArray(json.categories)) {
          throw new Error("Invalid format");
        }

        await db.resetAll();
        for (const cat of json.categories) await db.saveCategory(cat);
        for (const log of json.timelogs) await db.saveTimeLog(log);

        await refreshData();
        showToast("Data imported successfully.", "success");
      } catch (err) {
        showToast("Failed to import data. Invalid JSON format.", "error");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL data? This cannot be undone.",
      )
    ) {
      await db.resetAll();
      await refreshData();
      showToast("All data reset.", "info");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName, newCatColor);
    setNewCatName("");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Settings
        </h1>
      </header>

      <section className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
          Appearance
        </h3>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              Theme Preference
            </div>
            <div className="text-sm text-slate-500">
              Select your preferred color scheme.
            </div>
          </div>
          <Select
            value={theme}
            onChange={(e: any) => setTheme(e.target.value)}
            className="w-40"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
          Categories
        </h3>
        <Card className="p-4 space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} color={c.color} className="text-sm px-3 py-1">
                {c.name}
              </Badge>
            ))}
          </div>

          <form
            onSubmit={handleAddCategory}
            className="flex gap-4 items-end border-t dark:border-slate-800 pt-4"
          >
            <div className="flex-1">
              <Label>New Category Name</Label>
              <Input
                required
                value={newCatName}
                onChange={(e: any) => setNewCatName(e.target.value)}
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type="color"
                className="h-10 p-1 w-20 cursor-pointer"
                value={newCatColor}
                onChange={(e: any) => setNewCatColor(e.target.value)}
              />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
          Data Management
        </h3>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-4 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Export Data
              </div>
              <div className="text-sm text-slate-500">
                Download all your time logs and categories as JSON.
              </div>
            </div>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>

          <div className="p-4 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Import Data
              </div>
              <div className="text-sm text-slate-500">
                Restore from a previously exported JSON file.
              </div>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImport}
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" /> Import
              </Button>
            </div>
          </div>

          <div className="p-4 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="font-medium text-red-600 dark:text-red-400">
                Danger Zone
              </div>
              <div className="text-sm text-slate-500">
                Permanently delete all local data.
              </div>
            </div>
            <Button variant="danger" onClick={handleReset}>
              <Trash2 className="w-4 h-4" /> Reset All Data
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};
