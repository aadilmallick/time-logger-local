import { useEffect, useState } from "react";
import { useAppStore } from "../lib/AppContext";
import { calculateDuration, formatDuration, formatTime } from "../lib/utils";
import {
  Button,
  Badge,
  Dialog,
  Label,
  Input,
  Select,
  Card,
} from "./UIComponents";
import type { CurrentTask, Entry } from "../types";
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
import { EntryEditor } from "./EntryEditor";

export const EntryList = ({
  entries,
  isReadonly = false,
}: {
  entries: Entry[];
  isReadonly?: boolean;
}) => {
  const { categories, deleteEntry } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        No entries found for this day.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const cat = categories.find((c) => c.id === entry.categoryId);
        return (
          <Card
            key={entry.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat?.color || "#cbd5e1" }}
                />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {entry.taskName}
                </h4>
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <span>
                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                  </span>
                  <span>•</span>
                  <span>{formatDuration(entry.durationMinutes)}</span>
                  {cat && (
                    <>
                      <span>•</span>
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </>
                  )}
                </div>
                {entry.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>

            {!isReadonly && (
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  className="!p-2"
                  onClick={() => setEditingId(entry.id)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="!p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    if (window.confirm("Delete entry?")) deleteEntry(entry.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {editingId === entry.id && (
              <EntryEditor
                entry={entry}
                isOpen={true}
                onClose={() => setEditingId(null)}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
};
