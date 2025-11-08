"use client";

import { useAtom } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupingAtom, timeRangeAtom } from "@/providers/filters";

export const Filters = () => {
  const [timeRange, setTimeRange] = useAtom(timeRangeAtom);
  const [grouping, setGrouping] = useAtom(groupingAtom);

  return (
    <div className="flex gap-2">
      <Select onValueChange={setTimeRange} value={timeRange}>
        <SelectTrigger className="w-36 bg-background">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last-week">Last week</SelectItem>
          <SelectItem value="last-month">Last month</SelectItem>
          <SelectItem value="last-year">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setGrouping} value={grouping}>
        <SelectTrigger className="w-36 bg-background">
          <SelectValue placeholder="Select grouping" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">By day</SelectItem>
          <SelectItem value="week">By week</SelectItem>
          <SelectItem value="month">By month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
