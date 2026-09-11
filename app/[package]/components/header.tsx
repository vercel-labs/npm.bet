"use client";

import { SettingsIcon } from "lucide-react";
import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { GitHub } from "@/components/github";
import { GroupingSelector } from "@/components/grouping-selector";
import { Logo } from "@/components/logo";
import { MetricSelector } from "@/components/metric-selector";
import { Screenshot } from "@/components/screenshot";
import { ThemeToggle } from "@/components/theme-toggle";
import { TimeRangeSelector } from "@/components/time-range-selector";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ZeroModeToggle } from "@/components/zero-mode-toggle";
import { useTimeRange } from "@/providers/filters";

interface PackageHeaderProps {
  packages: string[];
}

export const PackageHeader = ({ packages }: PackageHeaderProps) => {
  const [timeRange] = useTimeRange();

  const { data } = useSWR<PackageData[]>(
    [packages, timeRange],
    async ([pkgs, range]: [string[], string]) =>
      Promise.all(pkgs.map((pkg) => getPackageData(pkg, range)))
  );

  return (
    <header className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-2">
        <TimeRangeSelector className="hidden sm:flex" />
        <GroupingSelector className="hidden sm:flex" />
        {packages.length > 1 && <MetricSelector className="hidden sm:flex" />}
        <ZeroModeToggle className="hidden sm:inline-flex" />

        <ButtonGroup className="sm:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="shadow-none" size="icon" variant="outline">
                <SettingsIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Settings</DrawerTitle>
                  <DrawerDescription>Customize your chart.</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-2 p-4 pb-0">
                  <TimeRangeSelector className="w-full" />
                  <GroupingSelector className="w-full" />
                  <div className="flex items-center gap-2">
                    {packages.length > 1 && <MetricSelector />}
                    <ZeroModeToggle showLabel size="sm" />
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
          <ThemeToggle />
        </ButtonGroup>

        <ButtonGroup className="hidden sm:flex">
          <Screenshot data={data} />
          <ThemeToggle />
        </ButtonGroup>

        <GitHub />
      </div>
    </header>
  );
};
