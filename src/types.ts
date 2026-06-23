// --- Types ---

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Entry = {
  id: string;
  timeLogId: string;
  taskName: string;
  description: string;
  categoryId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type TimeLog = {
  id: string;
  date: string; // YYYY-MM-DD
  entries: Entry[];
  createdAt: string;
};

export type CurrentTask = {
  taskName: string;
  description: string;
  categoryId: string;
  startTime: string; // ISO String
};
