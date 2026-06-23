// --- Custom SVG Charts ---

import { formatDuration } from "../lib/utils";
import type { Category } from "../types";

export const RingChart = ({
  percentage,
  color = "#3b82f6",
  label,
}: {
  percentage: number;
  color?: string;
  label: string;
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  );
};

export const CategoryBarChart = ({
  data,
  categories,
}: {
  data: Record<string, number>;
  categories: Category[];
}) => {
  const max = Math.max(...Object.values(data), 1);
  const items = Object.entries(data)
    .map(([catId, duration]) => ({
      cat: categories.find((c) => c.id === catId),
      duration,
    }))
    .filter((i) => i.cat)
    .sort((a, b) => b.duration - a.duration);

  return (
    <div className="space-y-3 mt-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-sm truncate text-slate-600 dark:text-slate-400">
            {item.cat?.name}
          </div>
          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.duration / max) * 100}%`,
                backgroundColor: item.cat?.color,
              }}
            />
          </div>
          <div className="w-16 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
            {formatDuration(item.duration)}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          No data to display
        </p>
      )}
    </div>
  );
};
