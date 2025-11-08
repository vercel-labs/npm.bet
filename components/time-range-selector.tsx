"use client";

import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeRange } from "@/providers/filters";

export const TimeRangeSelector = () => {
  const [timeRange, setTimeRange] = useTimeRange();

  return (
    <Select onValueChange={setTimeRange} value={timeRange}>
      <SelectTrigger className="w-40 bg-background [&>span]:flex-1">
        <CalendarIcon className="size-4" />
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last-week">Last week</SelectItem>
        <SelectItem value="last-month">Last month</SelectItem>
        <SelectItem value="last-year">Last year</SelectItem>
      </SelectContent>
    </Select>
  );
};
