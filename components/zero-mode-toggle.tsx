"use client";

import { SplineIcon } from "lucide-react";
import { useId } from "react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useZeroMode } from "@/providers/filters";

export const ZeroModeToggle = ({
  className,
  size = "default",
  showLabel = false,
}: {
  className?: string;
  size?: "default" | "sm";
  showLabel?: boolean;
}) => {
  const id = useId();
  const [zeroMode, setZeroMode] = useZeroMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex shrink-0", className)}>
          <Toggle
            aria-describedby={id}
            aria-label="Interpolate zeros"
            onPressedChange={(pressed) =>
              setZeroMode(pressed ? "estimated" : "reported")
            }
            pressed={zeroMode === "estimated"}
            size={size}
            variant="outline"
          >
            {showLabel ? "Interpolate" : <SplineIcon />}
          </Toggle>
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>Interpolate zeros</TooltipContent>
      <span className="sr-only" id={id}>
        Estimate one- or two-day zero-download gaps between reported positive
        days. Estimates are not confirmed download counts.
      </span>
    </Tooltip>
  );
};
