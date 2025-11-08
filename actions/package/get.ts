"use server";

export type PackageData = {
  start: string;
  end: string;
  package: string;
  downloads: {
    downloads: number;
    day: string;
  }[];
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const convertTimeRangeToAPIFormat = (timeRange: string): string => {
  // Native npm API ranges - pass through as-is
  if (
    timeRange === "last-week" ||
    timeRange === "last-month" ||
    timeRange === "last-year"
  ) {
    return timeRange;
  }

  // If it's already in date range format (YYYY-MM-DD:YYYY-MM-DD), pass through
  if (timeRange.includes(":")) {
    return timeRange;
  }

  const today = new Date();

  switch (timeRange) {
    case "last-2-years": {
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      return `${formatDateForAPI(twoYearsAgo)}:${formatDateForAPI(today)}`;
    }

    case "last-5-years": {
      const fiveYearsAgo = new Date(today);
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);
      return `${formatDateForAPI(fiveYearsAgo)}:${formatDateForAPI(today)}`;
    }

    case "all-time": {
      // npm registry started in 2010
      const npmStart = new Date(2010, 0, 1);
      return `${formatDateForAPI(npmStart)}:${formatDateForAPI(today)}`;
    }

    default:
      return timeRange;
  }
};

export const getPackageData = async (
  packageName: string,
  timeRange: string
): Promise<PackageData> => {
  const apiTimeRange = convertTimeRangeToAPIFormat(timeRange);

  const response = await fetch(
    `https://api.npmjs.org/downloads/range/${apiTimeRange}/${packageName}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour (3600 seconds)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch package data");
  }

  return response.json();
};
