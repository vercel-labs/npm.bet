"use client";

import { TZDate } from "@date-fns/tz";
import {
  isSameMonth,
  isSameWeek,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGrouping } from "@/providers/filters";

export const description = "An interactive line chart";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type ChartAreaInteractiveProps = {
  data: {
    start: string;
    end: string;
    package: string;
    downloads: {
      downloads: number;
      day: string;
    }[];
  }[];
};

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const [grouping] = useGrouping();

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

  const getDateRangeEnd = (startDate: string): string => {
    const date = new Date(startDate);
    if (grouping === "week") {
      date.setDate(date.getDate() + 6);
    } else if (grouping === "month") {
      date.setMonth(date.getMonth() + 1);
      date.setDate(date.getDate() - 1);
    }
    return date.toISOString().split("T")[0];
  };

  const mergePackageData = () => {
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
    // For weekly/monthly grouping, we need to check if the current period is complete
    if (sortedDates.length > 1) {
      const lastDateString = sortedDates.at(-1);

      if (!lastDateString) {
        return sortedDates;
      }

      const lastDate = parseISO(lastDateString);
      const now = new TZDate(new Date(), "UTC");
      let shouldRemove = false;

      if (grouping === "day") {
        // For daily grouping, check if it's today
        shouldRemove = isToday(lastDate);
      } else if (grouping === "week") {
        // For weekly grouping, check if we're in the same week
        shouldRemove = isSameWeek(lastDate, now, { weekStartsOn: 0 });
      } else if (grouping === "month") {
        // For monthly grouping, check if we're in the same month
        shouldRemove = isSameMonth(lastDate, now);
      }

      if (shouldRemove) {
        sortedDates.pop();
      }
    }

    return sortedDates.map((date) => ({
      date,
      dateEnd: grouping === "day" ? date : getDateRangeEnd(date),
      ...packagesByDate[date],
    }));
  };

  const chartData = mergePackageData();

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
                const date = new Date(value);
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
              tickFormatter={(value) => {
                if (value >= 1_000_000) {
                  return `${(value / 1_000_000).toFixed(1)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
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
                    const startDate = new Date(value);
                    const endDate = new Date(payload[0].payload.dateEnd);
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
                type="natural"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
