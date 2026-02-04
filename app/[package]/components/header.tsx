"use client";

import { SettingsIcon } from "lucide-react";
import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { GitHub } from "@/components/github";
import { GroupingSelector } from "@/components/grouping-selector";
import { Logo } from "@/components/logo";
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
import { useTimeRange } from "@/providers/filters";

interface PackageHeaderProps {
  packageName: string;
}

export const PackageHeader = ({ packageName }: PackageHeaderProps) => {
  const [timeRange] = useTimeRange();

  const { data } = useSWR<PackageData[]>(
    [packageName, timeRange],
    async ([pkg, range]: [string, string]) => [await getPackageData(pkg, range)]
  );

  return (
    <header className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-2">
        <TimeRangeSelector className="hidden sm:flex" />
        <GroupingSelector className="hidden sm:flex" />

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
