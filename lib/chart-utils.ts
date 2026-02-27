import {
  isSameMonth,
  isSameWeek,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/**
 * Get the start date of the week for a given date
 * Week starts on Sunday (weekStartsOn: 0)
 */
export const getWeekStart = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  return weekStart.toISOString().split("T")[0];
};

/**
 * Get the start date of the month for a given date
 */
export const getMonthStart = (date: Date): string => {
  const monthStart = startOfMonth(date);
  return monthStart.toISOString().split("T")[0];
};

/**
 * Group download data by day, week, or month
 */
export const groupData = (
  downloads: { downloads: number; day: string }[],
  groupBy: string
): { date: string; downloads: number }[] => {
  if (groupBy === "day") {
    return downloads.map((item) => ({
      date: item.day,
      downloads: item.downloads,
    }));
  }

  const getGroupKey = (date: Date): string => {
    if (groupBy === "week") {
      return getWeekStart(date);
    }
    return getMonthStart(date);
  };

  const grouped = downloads.reduce(
    (acc, item) => {
      const groupKey = getGroupKey(new Date(item.day));
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += item.downloads;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(grouped).map(([date, downloadCount]) => ({
    date,
    downloads: downloadCount,
  }));
};

/**
 * Check if a date should be removed because it's an incomplete period
 */
export const shouldRemoveIncompleteDate = (
  dateString: string,
  grouping: string
): boolean => {
  const date = parseISO(dateString);
  const now = new Date();

  if (grouping === "day") {
    // For daily grouping, check if it's today
    return isToday(date);
  }
  if (grouping === "week") {
    // For weekly grouping, check if we're in the same week
    return isSameWeek(date, now, { weekStartsOn: 0 });
  }
  if (grouping === "month") {
    // For monthly grouping, check if we're in the same month
    return isSameMonth(date, now);
  }

  return false;
};

/**
 * Format a number for display (e.g., 1000 -> 1K, 1000000 -> 1.0M)
 */
export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};
