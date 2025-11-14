import { startOfMonth, startOfWeek } from "date-fns";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPackageData } from "@/actions/package/get";

export const contentType = "image/png";

const fontRegex = /src: url\((.+)\) format\('(opentype|truetype)'\)/;

const loadGoogleFont = async (font: string, text: string, weights: string) => {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weights}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(fontRegex);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
};

// Colors for OG image (CSS variables don't work in OG images)
const colors = ["#f54a00", "#009689", "#104e64", "#ffba00", "#fd9a00"];

type Point = {
  x: number;
  y: number;
};

const createSvgPath = (points: Point[]): string => {
  if (points.length === 0) {
    return "";
  }

  const commands = points.map((point, index) => {
    const command = index === 0 ? "M" : "L";
    return `${command} ${point.x} ${point.y}`;
  });

  return commands.join(" ");
};

const normalizeData = (
  data: { downloads: number; date?: string; day?: string }[],
  width: number,
  height: number,
  maxDownloads: number
) => {
  if (data.length === 0) {
    return [];
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return data.map((item, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - (item.downloads / maxDownloads) * chartHeight,
  }));
};

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};

const getWeekStart = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  return weekStart.toISOString().split("T")[0];
};

const getMonthStart = (date: Date): string => {
  const monthStart = startOfMonth(date);
  return monthStart.toISOString().split("T")[0];
};

const groupData = (
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

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  const config = {
    width: 1200,
    height: 628,
    fonts: [
      {
        name: "Geist",
        data: await loadGoogleFont(
          "Geist",
          "abcdefghijklmnopqrstuvwxyz.0123456789",
          "400"
        ),
        weight: 400,
      },
      {
        name: "Geist",
        data: await loadGoogleFont(
          "Geist",
          "abcdefghijklmnopqrstuvwxyz.0123456789",
          "600"
        ),
        weight: 600,
      },
    ],
  };

  if (!query) {
    return new ImageResponse(
      <div tw="bg-[#f5f5f5] w-full h-full flex items-center justify-center">
        <div
          style={{ gap: "16px" }}
          tw="flex items-center justify-center shrink-0 mt-2"
        >
          {/** biome-ignore lint/a11y/noSvgWithoutTitle: "npm.bet logo" */}
          <svg
            fill="none"
            height={48}
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width={48}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 22v-9" />
            <path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" />
            <path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" />
            <path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" />
          </svg>
          <p tw="font-semibold text-5xl">npm.bet</p>
        </div>
      </div>,
      config as never
    );
  }

  const packages = query.split(",").slice(0, 5); // Limit to 5 packages
  const timeRange = searchParams.get("timeRange") ?? "last-year";
  const grouping = searchParams.get("grouping") ?? "week";

  try {
    // Fetch data for all packages
    const packageDataArray = await Promise.all(
      packages.map((pkg) => getPackageData(pkg.trim(), timeRange))
    );

    // Apply grouping to each package's data
    const groupedPackageData = packageDataArray.map((pkg) => ({
      ...pkg,
      downloads: groupData(pkg.downloads, grouping),
    }));

    // Find the maximum downloads value across all packages after grouping
    const maxDownloads = Math.max(
      ...groupedPackageData.flatMap((pkg) =>
        pkg.downloads.map((d) => d.downloads)
      )
    );

    // Create SVG chart dimensions
    const chartWidth = 1100;
    const chartHeight = 440;

    const chart = (
      <svg
        aria-label="npm package download comparison chart"
        height={chartHeight}
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        width={chartWidth}
      >
        {/* Grid lines */}
        <line
          stroke="#e5e7eb"
          strokeWidth="1"
          x1="40"
          x2={chartWidth - 40}
          y1={chartHeight - 40}
          y2={chartHeight - 40}
        />
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            opacity="0.5"
            stroke="#e5e7eb"
            strokeDasharray="4 4"
            strokeWidth="1"
            x1="40"
            x2={chartWidth - 40}
            y1={40 + (chartHeight - 80) * (1 - ratio)}
            y2={40 + (chartHeight - 80) * (1 - ratio)}
          />
        ))}

        {/* Draw lines for each package */}
        {groupedPackageData.map((pkg, index) => {
          const points = normalizeData(
            pkg.downloads,
            chartWidth,
            chartHeight,
            maxDownloads
          );
          const path = createSvgPath(points);

          return (
            <path
              d={path}
              fill="none"
              key={pkg.package}
              stroke={colors[index % colors.length]}
              strokeWidth="3"
            />
          );
        })}
      </svg>
    );

    const legend = (
      <div
        style={{ gap: "24px" }}
        tw="flex items-center justify-center flex-wrap mb-5"
      >
        {groupedPackageData.map((pkg, index) => {
          const totalDownloads = pkg.downloads.reduce(
            (sum, d) => sum + d.downloads,
            0
          );
          return (
            <div
              key={pkg.package}
              style={{ gap: "8px" }}
              tw="flex items-center"
            >
              <div
                style={{
                  background: colors[index % colors.length],
                }}
                tw="w-4 h-4 rounded-full"
              />
              <span tw="text-lg font-semibold text-[#1f2937]">
                {pkg.package}
              </span>
              <span tw="text-lg font-semibold text-[#737373]">
                {formatNumber(totalDownloads)}
              </span>
            </div>
          );
        })}
      </div>
    );

    const logo = (
      <div
        style={{ gap: "8px" }}
        tw="flex items-center justify-center shrink-0 mt-2"
      >
        {/** biome-ignore lint/a11y/noSvgWithoutTitle: "npm.bet logo" */}
        <svg
          fill="none"
          height={16}
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width={16}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22v-9" />
          <path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" />
          <path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" />
          <path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" />
        </svg>
        <p tw="font-semibold text-lg">npm.bet</p>
      </div>
    );

    return new ImageResponse(
      <div tw="bg-[#f5f5f5] w-full h-full flex flex-col p-12 overflow-hidden">
        <div tw="flex flex-col bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
          {chart}
          {legend}
        </div>
        {logo}
      </div>,
      config as never
    );
  } catch (error) {
    console.error(error);

    // Fallback error image
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#1f2937",
        }}
      >
        <div style={{ marginBottom: "20px", fontSize: "64px" }}>📦</div>
        <div style={{ fontWeight: 600 }}>{packages.join(" vs ")}</div>
        <div
          style={{
            fontSize: "24px",
            color: "#6b7280",
            marginTop: "10px",
          }}
        >
          npm.bet
        </div>
      </div>,
      config as never
    );
  }
};
