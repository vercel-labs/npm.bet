"use client";

import { addMonths, addWeeks } from "date-fns";
import { useEffect, useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DownloadTooltip } from "@/components/download-tooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber, shouldRemoveIncompleteDate } from "@/lib/chart-utils";
import { prepareDownloadData } from "@/lib/download-data";
import { useGrouping, useMetric, useZeroMode } from "@/providers/filters";

export const description = "An interactive line chart";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface ChartAreaInteractiveProps {
  data: {
    start: string;
    end: string;
    package: string;
    downloads: {
      downloads: number;
      day: string;
    }[];
  }[];
}

const getDateRangeEnd = (startDate: string, grouping: string) => {
  const date = new Date(startDate);

  if (grouping === "week") {
    return addWeeks(date, 1);
  }

  if (grouping === "month") {
    return addMonths(date, 1);
  }

  return date;
};

export const ChartAreaInteractive = ({ data }: ChartAreaInteractiveProps) => {
  const [grouping] = useGrouping();
  const [metric, setMetric] = useMetric();
  const [zeroMode] = useZeroMode();
  const preparedByPackage = useMemo(
    () =>
      new Map(
        data.map((pkg) => [
          pkg.package,
          new Map(
            prepareDownloadData(pkg.downloads, grouping, zeroMode).map(
              (point) => [point.date, point]
            )
          ),
        ])
      ),
    [data, grouping, zeroMode]
  );
  const isShare = metric === "share" && data.length > 1;
  const packageNames = useMemo(() => data.map((pkg) => pkg.package), [data]);

  useEffect(() => {
    if (metric === "share" && data.length <= 1) {
      setMetric(null);
    }
  }, [metric, data.length, setMetric]);

  const chartData = useMemo(() => {
    const allDates = new Set<string>();
    const packagesByDate: Record<string, Record<string, number>> = {};

    for (const pkg of data) {
      const grouped = preparedByPackage.get(pkg.package);
      for (const item of grouped?.values() ?? []) {
        allDates.add(item.date);
        if (!packagesByDate[item.date]) {
          packagesByDate[item.date] = {};
        }
        packagesByDate[item.date][pkg.package] = item.downloads;
      }
    }

    const sortedDates = Array.from(allDates).sort();

    // Remove the most recent data point to avoid showing incomplete periods
    if (sortedDates.length > 1) {
      const lastDateString = sortedDates.at(-1);
      if (
        lastDateString &&
        shouldRemoveIncompleteDate(lastDateString, grouping)
      ) {
        sortedDates.pop();
      }
    }

    return sortedDates.map((date) => {
      const row: Record<string, string | number> = {
        date,
        dateEnd: getDateRangeEnd(date, grouping).toISOString().split("T")[0],
      };

      const dateData = packagesByDate[date] ?? {};

      if (isShare) {
        const total = packageNames.reduce(
          (sum, name) => sum + (dateData[name] ?? 0),
          0
        );
        for (const name of packageNames) {
          row[name] =
            total > 0
              ? Number((((dateData[name] ?? 0) / total) * 100).toFixed(1))
              : 0;
        }
      } else {
        for (const name of packageNames) {
          row[name] = dateData[name] ?? 0;
        }
      }

      return row;
    });
  }, [data, grouping, isShare, packageNames, preparedByPackage]);

  const hasEstimates = chartData.some((row) =>
    packageNames.some(
      (name) =>
        (preparedByPackage.get(name)?.get(String(row.date))?.estimatedDays ??
          0) > 0
    )
  );

  const shareYMax = useMemo(() => {
    if (!isShare || chartData.length === 0) {
      return 100;
    }
    const maxValue = Math.max(
      ...chartData.flatMap((row) =>
        typeof row === "string"
          ? [0]
          : packageNames.map((name) => Number(row[name] ?? 0))
      )
    );
    return Math.min(100, Math.ceil((maxValue + 5) / 10) * 10);
  }, [isShare, chartData, packageNames]);

  const chartConfig = data.reduce(
    (acc, pkg, index) => {
      acc[pkg.package] = {
        label: pkg.package,
        color: colors[index % colors.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  return (
    <Card className="size-full shadow-none">
      <CardContent className="min-h-0 flex-1">
        <ChartContainer className="size-full" config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const [year, month, day] = value.split("-");
                const date = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day)
                );
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={isShare ? [0, shareYMax] : undefined}
              tickFormatter={(value) => {
                if (isShare) {
                  return `${value}%`;
                }
                return formatNumber(value);
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <DownloadTooltip
                  grouping={grouping}
                  isShare={isShare}
                  preparedByPackage={preparedByPackage}
                />
              }
              cursor={false}
            />
            {data.map((pkg, index) => (
              <Line
                dataKey={pkg.package}
                dot={({ cx, cy, payload }) => {
                  const point = preparedByPackage
                    .get(pkg.package)
                    ?.get(payload.date);
                  const estimated = (point?.estimatedDays ?? 0) > 0;
                  const denominatorEstimated =
                    isShare &&
                    packageNames.some(
                      (name) =>
                        (preparedByPackage.get(name)?.get(payload.date)
                          ?.estimatedDays ?? 0) > 0
                    );
                  return estimated || denominatorEstimated ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      data-estimated-date={payload.date}
                      data-estimated-package={pkg.package}
                      fill="var(--background)"
                      key={`${pkg.package}-${payload.date}`}
                      r={4}
                      stroke={colors[index % colors.length]}
                      strokeDasharray="2 2"
                      strokeWidth={1.5}
                    >
                      <title>
                        {pkg.package}:{" "}
                        {estimated
                          ? "estimated downloads"
                          : "share includes estimates"}
                      </title>
                    </circle>
                  ) : (
                    <g key={`${pkg.package}-${payload.date}`} />
                  );
                }}
                key={pkg.package}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                type="monotone"
              />
            ))}
            <ChartLegend
              content={(props) => (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3">
                  <ChartLegendContent
                    className="pt-0"
                    payload={props.payload}
                    verticalAlign={props.verticalAlign}
                  />
                  {hasEstimates && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          aria-label="About estimated downloads"
                          className="inline-flex items-center gap-1 rounded-sm text-muted-foreground text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          type="button"
                        >
                          <span aria-hidden="true">≈</span>
                          <span className="hidden sm:inline">Estimated</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64" sideOffset={6}>
                        Short zero-download gaps are estimated. Hover a point to
                        compare with npm-reported counts.
                        {isShare && " Shares include estimated downloads."}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
