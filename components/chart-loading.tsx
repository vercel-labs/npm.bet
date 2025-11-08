"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const mockData = Array.from({ length: 30 }, (_, index) => ({
  date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
  downloads: Math.floor(Math.random() * 1000),
}));

export const ChartLoading = () => (
  <Card className="size-full shadow-none">
    <CardContent className="size-full">
      <ChartContainer className="size-full" config={{}}>
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="fillDownloads" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-border)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-border)"
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
            stroke="var(--color-border)"
            type="natural"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  </Card>
);
