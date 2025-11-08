"use client";

import { useAtomValue } from "jotai";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { groupingAtom } from "@/providers/filters";

export const description = "An interactive area chart";

const chartConfig = {
  downloads: {
    label: "Downloads",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ChartAreaInteractiveProps = {
  data: {
    start: string;
    end: string;
    package: string;
    downloads: {
      downloads: number;
      day: string;
    }[];
  };
};

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const grouping = useAtomValue(groupingAtom);

  const getWeekStart = (date: Date): string => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    return weekStart.toISOString().split("T")[0];
  };

  const getMonthStart = (date: Date): string => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
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

    return Object.entries(grouped).map(([date, downloads]) => ({
      date,
      downloads,
    }));
  };

  const chartData = groupData(data.downloads, grouping);

  return (
    <Card className="size-full shadow-none">
      <CardContent className="size-full">
        <ChartContainer className="size-full" config={chartConfig}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDownloads" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-downloads)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-downloads)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              }
              cursor={false}
            />
            <Area
              dataKey="downloads"
              fill="url(#fillDownloads)"
              stroke="var(--color-downloads)"
              type="natural"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
