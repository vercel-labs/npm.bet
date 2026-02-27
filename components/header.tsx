"use client";

import { SettingsIcon } from "lucide-react";
import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
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
import { usePackages, useTimeRange } from "@/providers/filters";
import { EmbedDialog } from "./embed-dialog";
import { GitHub } from "./github";
import { GroupingSelector } from "./grouping-selector";
import { Logo } from "./logo";
import { MetricSelector } from "./metric-selector";
import { Screenshot } from "./screenshot";
import { ThemeToggle } from "./theme-toggle";
import { TimeRangeSelector } from "./time-range-selector";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

export const Header = () => {
  const [packages] = usePackages();
  const [timeRange] = useTimeRange();

  const { data } = useSWR<PackageData[]>(
    packages.length > 0 ? [packages, timeRange] : null,
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
                <div className="space-y-2 p-4 pb-0">
                  <TimeRangeSelector className="w-full" />
                  <GroupingSelector className="w-full" />
                  {packages.length > 1 && <MetricSelector className="w-full" />}
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
          <EmbedDialog />
          <ThemeToggle />
        </ButtonGroup>

        <GitHub />
      </div>
    </header>
  );
};
