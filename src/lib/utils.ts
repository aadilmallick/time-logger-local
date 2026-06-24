// --- Utils & Helpers ---

import type { Category, Entry } from "../types";

const generateId = () => {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  // Fallback for environments without crypto
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const getLocalDateString = (date: Date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

const formatTime = (isoString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const calculateDuration = (start: string, end: string) => {
  return Math.max(
    0,
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
};

const checkOverlap = (
  entries: Entry[],
  newStart: Date,
  newEnd: Date,
  excludeId?: string,
) => {
  return entries.some((entry) => {
    if (excludeId && entry.id === excludeId) return false;
    const estart = new Date(entry.startTime).getTime();
    const eend = new Date(entry.endTime).getTime();
    const nstart = newStart.getTime();
    const nend = newEnd.getTime();
    return nstart < eend && nend > estart;
  });
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "no-category",
    name: "No category",
    color: "#cbd5e1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-prod",
    name: "Productivity",
    color: "#3b82f6",
    createdAt: new Date().toISOString(),
  }, // blue
  {
    id: "cat-food",
    name: "Food",
    color: "#f97316",
    createdAt: new Date().toISOString(),
  }, // orange
  {
    id: "cat-exer",
    name: "Exercise",
    color: "#22c55e",
    createdAt: new Date().toISOString(),
  }, // green
  {
    id: "cat-ent",
    name: "Entertainment",
    color: "#a855f7",
    createdAt: new Date().toISOString(),
  }, // purple
  {
    id: "cat-sleep",
    name: "Sleep",
    color: "#6366f1",
    createdAt: new Date().toISOString(),
  }, // indigo
  {
    id: "cat-other",
    name: "Other",
    color: "#64748b",
    createdAt: new Date().toISOString(),
  }, // slate
];

export {
  generateId,
  getLocalDateString,
  formatTime,
  formatDuration,
  calculateDuration,
  checkOverlap,
  DEFAULT_CATEGORIES,
};
