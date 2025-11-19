"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRemoveCurrentPeriod } from "@/providers/filters";

export const RemoveCurrentPeriod = () => {
  const [removeCurrentPeriod, setRemoveCurrentPeriod] =
    useRemoveCurrentPeriod();

  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="cursor-pointer" htmlFor="remove-current-period">
        Remove current period
      </Label>
      <Switch
        checked={removeCurrentPeriod}
        id="remove-current-period"
        onCheckedChange={setRemoveCurrentPeriod}
      />
    </div>
  );
};
