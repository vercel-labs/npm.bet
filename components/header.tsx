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
import { EmbedDialog } from "./embed-dialog";
import { usePackages, useTimeRange } from "@/providers/filters";
import { GitHub } from "./github";
import { GroupingSelector } from "./grouping-selector";
import { Logo } from "./logo";
import { Screenshot } from "./screenshot";
import { ThemeToggle } from "./theme-toggle";
import { TimeRangeSelector } from "./time-range-selector";
import { Button } from "./ui/button";

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

        <Drawer>
          <DrawerTrigger asChild>
            <Button
              className="shadow-none sm:hidden"
              size="icon"
              variant="outline"
            >
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
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <EmbedDialog />
        <Screenshot className="hidden sm:flex" data={data} />
        <ThemeToggle />
        <GitHub />
      </div>
    </header>
  );
};
