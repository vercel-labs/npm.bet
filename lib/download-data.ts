import { groupData } from "./chart-utils";

export const zeroModes = ["reported", "estimated"] as const;
export type ZeroMode = (typeof zeroModes)[number];

export interface DailyDownload {
  day: string;
  downloads: number;
}

export interface PreparedDownload {
  date: string;
  downloads: number;
  reportedDownloads: number;
  estimatedDays: number;
}

export interface InterpolatedDownload extends DailyDownload {
  reportedDownloads: number;
  estimated: boolean;
}

const DAY_MS = 86_400_000;
const MAX_ZERO_DAYS = 2;

export const parseZeroMode = (value: unknown): ZeroMode =>
  value === "estimated" ? "estimated" : "reported";

export const interpolateZeroDownloads = (
  downloads: readonly DailyDownload[]
): InterpolatedDownload[] => {
  let previousTime = Number.NEGATIVE_INFINITY;
  const dates = downloads.map(({ day, downloads: count }) => {
    const time = Date.parse(`${day}T00:00:00.000Z`);
    if (
      !Number.isFinite(time) ||
      new Date(time).toISOString().slice(0, 10) !== day ||
      time <= previousTime ||
      !Number.isSafeInteger(count) ||
      count < 0
    ) {
      throw new RangeError(
        "Expected ordered unique UTC days and nonnegative integer downloads"
      );
    }
    previousTime = time;
    return time;
  });
  const result = downloads.map((item) => ({
    ...item,
    reportedDownloads: item.downloads,
    estimated: false,
  }));

  for (let start = 0; start < downloads.length; start++) {
    if (downloads[start].downloads !== 0) {
      continue;
    }
    let end = start;
    while (end < downloads.length && downloads[end].downloads === 0) {
      end++;
    }
    const length = end - start;
    const left = downloads[start - 1];
    const right = downloads[end];
    if (
      length <= MAX_ZERO_DAYS &&
      left?.downloads > 0 &&
      right?.downloads > 0 &&
      dates[end] - dates[start - 1] === (length + 1) * DAY_MS
    ) {
      for (let index = start; index < end; index++) {
        const progress =
          (dates[index] - dates[start - 1]) / (dates[end] - dates[start - 1]);
        result[index] = {
          ...result[index],
          downloads: Math.round(
            left.downloads + (right.downloads - left.downloads) * progress
          ),
          estimated: true,
        };
      }
    }
    start = end - 1;
  }

  return result;
};

export const prepareDownloadData = (
  downloads: readonly DailyDownload[],
  grouping: string,
  zeroMode: ZeroMode = "reported"
): PreparedDownload[] => {
  const reported = groupData([...downloads], grouping);
  if (zeroMode !== "estimated") {
    return reported.map((item) => ({
      ...item,
      reportedDownloads: item.downloads,
      estimatedDays: 0,
    }));
  }

  const interpolated = interpolateZeroDownloads(downloads);
  const displayed = groupData(interpolated, grouping);
  const estimatedCounts = groupData(
    interpolated.map((item) => ({
      day: item.day,
      downloads: Number(item.estimated),
    })),
    grouping
  );

  return displayed.map((item, index) => ({
    ...item,
    reportedDownloads: reported[index].downloads,
    estimatedDays: estimatedCounts[index].downloads,
  }));
};
