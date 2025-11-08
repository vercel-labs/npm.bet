"use client";

import { GroupIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGrouping } from "@/providers/filters";

export const GroupingSelector = () => {
  const [grouping, setGrouping] = useGrouping();

  return (
    <Select onValueChange={setGrouping} value={grouping}>
      <SelectTrigger className="w-36 bg-background [&>span]:flex-1">
        <GroupIcon className="size-4" />
        <SelectValue placeholder="Select grouping" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">By day</SelectItem>
        <SelectItem value="week">By week</SelectItem>
        <SelectItem value="month">By month</SelectItem>
      </SelectContent>
    </Select>
  );
};
