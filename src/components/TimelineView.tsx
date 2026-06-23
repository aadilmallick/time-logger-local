import { useEffect, useState } from "react";
import { useAppStore } from "../lib/AppContext";
import { calculateDuration, formatDuration, formatTime } from "../lib/utils";
import { Square } from "lucide-react";
import { Button, Badge } from "./UIComponents";
import type { CurrentTask, Entry } from "../types";

export const TimelineView = ({
  entries,
  activeTask,
}: {
  entries: Entry[];
  activeTask: CurrentTask | null;
}) => {
  const { categories } = useAppStore();

  return (
    <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-end">
      {/* 24h markings */}
      {[0, 6, 12, 18, 24].map((h) => (
        <div
          key={h}
          className="absolute h-full border-l border-slate-200 dark:border-slate-700 pointer-events-none"
          style={{ left: `${(h / 24) * 100}%` }}
        >
          <span className="absolute -top-6 -translate-x-1/2 text-[10px] text-slate-400">
            {h}:00
          </span>
        </div>
      ))}

      {entries.map((entry) => {
        const startDt = new Date(entry.startTime);
        const startMin = startDt.getHours() * 60 + startDt.getMinutes();
        const widthPercent = (entry.durationMinutes / 1440) * 100;
        const leftPercent = (startMin / 1440) * 100;
        const cat = categories.find((c) => c.id === entry.categoryId);

        return (
          <div
            key={entry.id}
            className="absolute top-0 bottom-0 min-w-[2px] hover:opacity-80 transition-opacity cursor-pointer group"
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: cat?.color || "#cbd5e1",
            }}
          >
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
              {entry.taskName} ({formatDuration(entry.durationMinutes)})
            </div>
          </div>
        );
      })}

      {activeTask &&
        (() => {
          const startDt = new Date(activeTask.startTime);
          const startMin = startDt.getHours() * 60 + startDt.getMinutes();
          const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
          const duration = Math.max(1, nowMin - startMin);
          const widthPercent = (duration / 1440) * 100;
          const leftPercent = (startMin / 1440) * 100;
          const cat = categories.find((c) => c.id === activeTask.categoryId);

          return (
            <div
              className="absolute top-0 bottom-0 min-w-[2px] animate-pulse bg-stripes"
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                backgroundColor: cat?.color || "#cbd5e1",
              }}
            />
          );
        })()}
    </div>
  );
};
