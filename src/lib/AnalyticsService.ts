// --- Analytics Service ---

import type { Entry } from "../types";
import { calculateDuration } from "./utils";

export const AnalyticsEngine = {
  calculateDeadTime: (entries: Entry[], forSingleDay: boolean = true) => {
    if (entries.length === 0) return 0;

    // Assumes entries are sorted by start time
    let deadTime = 0;
    for (let i = 0; i < entries.length - 1; i++) {
      const gap = calculateDuration(
        entries[i].endTime,
        entries[i + 1].startTime,
      );
      if (gap > 0) deadTime += gap;
    }

    // If calculating for today and day isn't over, add gap to current time?
    // The spec implies dead time is "sum of all gaps between entries". I'll stick to strictly between entries.
    return deadTime;
  },

  computeStats: (entries: Entry[], deadTimeMinutes: number) => {
    const intentionalTime = entries.reduce(
      (acc, e) => acc + e.durationMinutes,
      0,
    );
    const taskCount = entries.length;
    const longestTask = entries.reduce(
      (max, e) => Math.max(max, e.durationMinutes),
      0,
    );
    const prodPercent =
      intentionalTime + deadTimeMinutes > 0
        ? (intentionalTime / (intentionalTime + deadTimeMinutes)) * 100
        : 0;

    const byCategory = entries.reduce(
      (acc, e) => {
        acc[e.categoryId] = (acc[e.categoryId] || 0) + e.durationMinutes;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      intentionalTime,
      deadTimeMinutes,
      taskCount,
      longestTask,
      prodPercent,
      byCategory,
    };
  },
};
