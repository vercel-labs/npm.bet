import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RemoveCurrentPeriod } from "./remove-current-period";

export const Settings = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button className="shadow-none" size="icon" variant="outline">
        <SettingsIcon />
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <RemoveCurrentPeriod />
    </PopoverContent>
  </Popover>
);
