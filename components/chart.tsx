"use client";

import { addMonths, addWeeks } from "date-fns";
import { useEffect, useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  formatNumber,
  groupData,
  shouldRemoveIncompleteDate,
} from "@/lib/chart-utils";
import { useGrouping, useMetric } from "@/providers/filters";

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
  }, [data, grouping, isShare, packageNames]);

  const shareYMax = useMemo(() => {
    if (!isShare || chartData.length === 0) return 100;
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
      <CardContent className="size-full">
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
                <ChartTooltipContent
                  className="[&_.flex.justify-between]:gap-8"
                  indicator="dot"
                  labelFormatter={(value, payload) => {
                    if (!payload?.[0]?.payload) {
                      return value;
                    }
                    const parseDate = (dateStr: string) => {
                      const [year, month, day] = dateStr.split("-");
                      return new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day)
                      );
                    };
                    const startDate = parseDate(value);
                    const endDate = parseDate(payload[0].payload.dateEnd);
                    const formatDate = (date: Date) =>
                      date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });

                    if (grouping === "day") {
                      return formatDate(startDate);
                    }
                    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
                  }}
                  valueFormatter={
                    isShare
                      ? (value) => `${Number(value).toFixed(1)}%`
                      : undefined
                  }
                />
              }
              cursor={false}
            />
            {data.map((pkg, index) => (
              <Line
                dataKey={pkg.package}
                dot={false}
                key={pkg.package}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                type="monotone"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
