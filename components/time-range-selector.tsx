"use client";

import { CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useTimeRange } from "@/providers/filters";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card, CardContent } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const PREDEFINED_RANGES = [
  { label: "Last week", value: "last-week" },
  { label: "Last month", value: "last-month" },
  { label: "Last year", value: "last-year" },
  { label: "Last 2 years", value: "last-2-years" },
  { label: "Last 5 years", value: "last-5-years" },
  { label: "All time", value: "all-time" },
] as const;

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const parseDateRangeFromString = (
  rangeString: string
): DateRange | undefined => {
  if (!rangeString.includes(":")) {
    return;
  }

  const [fromStr, toStr] = rangeString.split(":");

  // Parse dates with explicit time to avoid timezone issues
  // YYYY-MM-DD format when parsed creates UTC midnight, but we want local midnight
  const [fromYear, fromMonth, fromDay] = fromStr.split("-").map(Number);
  const [toYear, toMonth, toDay] = toStr.split("-").map(Number);

  const from = new Date(fromYear, fromMonth - 1, fromDay);
  const to = new Date(toYear, toMonth - 1, toDay);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return;
  }

  return { from, to };
};

export const TimeRangeSelector = () => {
  const [timeRange, setTimeRange] = useTimeRange();

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const formattedRange = `${formatDateForAPI(range.from)}:${formatDateForAPI(range.to)}`;
      setTimeRange(formattedRange);
    }
  };

  const selectedRange = PREDEFINED_RANGES.find(
    (range) => range.value === timeRange
  );

  const customDateRange = useMemo(() => {
    if (selectedRange) {
      return;
    }
    return parseDateRangeFromString(timeRange);
  }, [timeRange, selectedRange]);

  const displayText = useMemo(() => {
    if (selectedRange) {
      return selectedRange.label;
    }

    if (customDateRange?.from && customDateRange?.to) {
      return `${formatDateForDisplay(customDateRange.from)} - ${formatDateForDisplay(customDateRange.to)}`;
    }

    return "Select range";
  }, [selectedRange, customDateRange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-64 text-left font-normal shadow-none"
          variant="outline"
        >
          <CalendarIcon />
          <span className="flex-1 truncate text-sm">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Card className="gap-0 border-0 p-0 shadow-none">
          <CardContent className="relative flex flex-col p-0 md:flex-row">
            <div className="border-b p-6 md:border-r md:border-b-0">
              <Calendar
                className="bg-transparent p-0"
                formatters={{
                  formatWeekdayName: (date) =>
                    date.toLocaleString("en-US", { weekday: "short" }),
                }}
                mode="range"
                onSelect={handleRangeSelect}
                selected={customDateRange}
                showOutsideDays={false}
              />
            </div>
            <div className="flex w-full flex-col gap-2 p-6 md:w-48">
              <div className="mb-2 font-medium text-sm">Predefined Ranges</div>
              {PREDEFINED_RANGES.map((range) => (
                <Button
                  className="w-full justify-start shadow-none"
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  variant={timeRange === range.value ? "default" : "outline"}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
