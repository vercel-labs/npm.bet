import { type NextRequest, NextResponse } from "next/server";
import { getPackageData, type PackageData } from "@/actions/package/get";
import {
  formatNumber,
  groupData,
  shouldRemoveIncompleteDate,
} from "@/lib/chart-utils";

const colors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
];

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

const mergePackageData = (
  data: PackageData[],
  grouping: string
): ChartDataPoint[] => {
  const allDates = new Set<string>();
  const packagesByDate: Record<string, Record<string, number>> = {};

  for (const pkg of data) {
    const grouped = groupData(pkg.downloads, grouping);
    for (const item of grouped) {
      allDates.add(item.date);
      if (!packagesByDate[item.date]) {
        packagesByDate[item.date] = {};
      }
      packagesByDate[item.date][pkg.package] = item.downloads;
    }
  }

  const sortedDates = Array.from(allDates).sort();

  // Remove the most recent incomplete data point
  if (sortedDates.length > 1) {
    const lastDateString = sortedDates.at(-1);
    if (
      lastDateString &&
      shouldRemoveIncompleteDate(lastDateString, grouping)
    ) {
      sortedDates.pop();
    }
  }

  return sortedDates.map((date) => ({
    date,
    ...packagesByDate[date],
  }));
};

const generateSVGChart = (
  packageData: PackageData[],
  grouping: string
): string => {
  const width = 800;
  // Adjust height based on number of packages for legend
  const legendItemHeight = 18;
  const legendHeight = Math.max(packageData.length * legendItemHeight, 20);
  const baseHeight = 400;
  const height = baseHeight + legendHeight;

  const padding = {
    top: 40,
    right: 40,
    bottom: 60 + legendHeight,
    left: 60,
  };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = baseHeight - 100; // Fixed chart height (400 - top 40 - bottom 60)

  const chartData = mergePackageData(packageData, grouping);

  if (chartData.length === 0) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#ffffff"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
          No data available
        </text>
      </svg>
    `;
  }

  // Calculate scales
  const maxDownloads = Math.max(
    ...chartData.flatMap((d) =>
      Object.entries(d)
        .filter(([key]) => key !== "date")
        .map(([, value]) => value as number)
    )
  );

  const xScale = (index: number) =>
    padding.left + (index / (chartData.length - 1)) * chartWidth;

  const yScale = (value: number) =>
    padding.top + chartHeight - (value / maxDownloads) * chartHeight;

  // Generate Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round((maxDownloads / (yTicks - 1)) * i)
  );

  // Helper function to create smooth curves using Cardinal spline
  const createSmoothPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) {
      return "";
    }
    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y}`;
    }
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    // Cardinal spline tension (0 = Catmull-Rom, 0.5 = smoother)
    const tension = 0.5;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Calculate control points for cubic Bezier curve
      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return path;
  };

  // Generate smooth lines for each package
  const lines = packageData.map((pkg, pkgIndex) => {
    const points = chartData
      .map((d, i) => {
        const value = d[pkg.package] as number | undefined;
        if (value === undefined) {
          return null;
        }
        return { x: xScale(i), y: yScale(value) };
      })
      .filter((p): p is { x: number; y: number } => p !== null);

    const pathData = createSmoothPath(points);

    return `
      <path
        fill="none"
        stroke="${colors[pkgIndex % colors.length]}"
        stroke-width="2"
        d="${pathData}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `;
  });

  // Generate X-axis labels (show every nth label to avoid crowding)
  const xLabelStep = Math.ceil(chartData.length / 8);
  const xLabels = chartData
    .map((d, i) => {
      if (i % xLabelStep !== 0 && i !== chartData.length - 1) {
        return "";
      }
      const date = new Date(d.date);
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `
        <text
          x="${xScale(i)}"
          y="${height - padding.bottom + 20}"
          text-anchor="middle"
          font-family="Arial"
          font-size="12"
          fill="#666"
        >
          ${label}
        </text>
      `;
    })
    .join("");

  // Generate Y-axis labels
  const yLabels = yTickValues
    .map(
      (value) => `
        <text
          x="${padding.left - 10}"
          y="${yScale(value)}"
          text-anchor="end"
          font-family="Arial"
          font-size="12"
          fill="#666"
          alignment-baseline="middle"
        >
          ${formatNumber(value)}
        </text>
        <line
          x1="${padding.left}"
          y1="${yScale(value)}"
          x2="${width - padding.right}"
          y2="${yScale(value)}"
          stroke="#e5e5e5"
          stroke-width="1"
        />
      `
    )
    .join("");

  // Generate legend (vertical layout at the bottom, outside chart area)
  const legendStartY = height - padding.bottom + 48; // Start below x-axis labels
  const legend = packageData
    .map(
      (pkg, i) => `
        <g transform="translate(${padding.left}, ${legendStartY + i * legendItemHeight})">
          <line x1="0" y1="0" x2="20" y2="0" stroke="${colors[i % colors.length]}" stroke-width="2"/>
          <text x="25" y="0" font-family="Arial" font-size="12" fill="#333" alignment-baseline="middle">
            ${pkg.package}
          </text>
        </g>
      `
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#ffffff"/>

      <!-- Brand Label with Logo -->
      <g transform="translate(${width / 2 - 32}, 12)">
        <g transform="scale(0.18) translate(-40, 4)">
          <svg viewBox="0 0 76 65" width="76" height="65">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#000"/>
          </svg>
        </g>
        <text
          x="12"
          y="8"
          font-family="Arial"
          font-size="12"
          fill="#737373"
          opacity="0.5"
          alignment-baseline="middle"
        >
          /
        </text>
        <text
          x="20"
          y="8"
          font-family="Arial"
          font-size="12"
          fill="#000"
          alignment-baseline="middle"
        >
          npm.bet
        </text>
      </g>

      <!-- Y-axis grid and labels -->
      ${yLabels}

      <!-- Chart lines -->
      ${lines.join("")}

      <!-- X-axis labels -->
      ${xLabels}

      <!-- Axes -->
      <line
        x1="${padding.left}"
        y1="${padding.top}"
        x2="${padding.left}"
        y2="${height - padding.bottom}"
        stroke="#333"
        stroke-width="1"
      />
      <line
        x1="${padding.left}"
        y1="${height - padding.bottom}"
        x2="${width - padding.right}"
        y2="${height - padding.bottom}"
        stroke="#333"
        stroke-width="1"
      />

      <!-- Legend -->
      ${legend}
    </svg>
  `;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const packagesParam = searchParams.get("q");
    const timeRange = searchParams.get("timeRange") || "last-year";
    const grouping = searchParams.get("grouping") || "week";

    if (!packagesParam) {
      return new NextResponse(
        `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
          <rect width="800" height="400" fill="#ffffff"/>
          <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
            Please provide package name(s) via ?q=package-name
          </text>
        </svg>
      `,
        {
          status: 400,
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          },
        }
      );
    }

    // Parse packages (support comma-separated list)
    const packages = packagesParam.split(",").filter(Boolean);

    // Fetch data for all packages
    const packageData = await Promise.all(
      packages.map((pkg) => getPackageData(pkg.trim(), timeRange))
    );

    // Generate SVG
    const svg = generateSVGChart(packageData, grouping);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating SVG chart:", error);

    return new NextResponse(
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
        <rect width="800" height="400" fill="#ffffff"/>
        <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#ff0000">
          Error generating chart
        </text>
      </svg>
    `,
      {
        status: 500,
        headers: {
          "Content-Type": "image/svg+xml",
        },
      }
    );
  }
}
