"use client";

import type { ComponentProps } from "react";
import { ChartTooltipContent } from "@/components/ui/chart";
import type { PreparedDownload } from "@/lib/download-data";

type DownloadTooltipProps = ComponentProps<typeof ChartTooltipContent> & {
  grouping: string;
  isShare: boolean;
  preparedByPackage: ReadonlyMap<string, ReadonlyMap<string, PreparedDownload>>;
};

export const DownloadTooltip = ({
  grouping,
  isShare,
  preparedByPackage,
  ...props
}: DownloadTooltipProps) => {
  const date = props.payload?.[0]?.payload?.date;
  const points = [...preparedByPackage.values()].map((series) =>
    series.get(date)
  );
  const hasEstimates = points.some((point) => (point?.estimatedDays ?? 0) > 0);
  const reportedSummary = [...preparedByPackage.entries()]
    .flatMap(([name, series]) => {
      const point = series.get(date);
      return point && (isShare || point.estimatedDays > 0)
        ? [`${name}: ${point.reportedDownloads.toLocaleString("en-US")}`]
        : [];
    })
    .join(" · ");
  let estimateNote = "≈ Includes estimated days";
  if (isShare) {
    estimateNote = "≈ Shares include estimated downloads";
  } else if (grouping === "day") {
    estimateNote = "≈ Estimated · npm reported 0";
  }
  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  return (
    <ChartTooltipContent
      {...props}
      footer={
        hasEstimates ? (
          <div className="max-w-64 pt-1 text-muted-foreground text-xs">
            <p>{estimateNote}</p>
            {(isShare || grouping !== "day") && (
              <p className="pt-1">npm reported: {reportedSummary}</p>
            )}
          </div>
        ) : undefined
      }
      formatter={(value, name, item) => {
        const point = preparedByPackage.get(String(name))?.get(date);
        const estimated = isShare
          ? hasEstimates
          : (point?.estimatedDays ?? 0) > 0;
        const formatted = isShare
          ? `${Number(value).toFixed(1)}%`
          : Number(value).toLocaleString("en-US");
        const reported = point?.reportedDownloads.toLocaleString("en-US");
        return (
          <div className="flex w-full items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              {name}
            </span>
            <span
              className="flex items-baseline gap-1 font-medium font-mono tabular-nums"
              title={
                reported === undefined
                  ? undefined
                  : `npm reported: ${reported} downloads`
              }
            >
              {estimated && (
                <span aria-hidden="true" className="text-muted-foreground">
                  ≈
                </span>
              )}
              {formatted}
              {estimated && (
                <span className="sr-only">
                  {" "}
                  Estimated; npm reported {reported} downloads.
                </span>
              )}
            </span>
          </div>
        );
      }}
      indicator="dot"
      labelFormatter={() => {
        if (!date) {
          return props.label;
        }
        const end = props.payload?.[0]?.payload?.dateEnd;
        return grouping === "day" || !end
          ? formatDate(date)
          : `${formatDate(date)} - ${formatDate(end)}`;
      }}
    />
  );
};
