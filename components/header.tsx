import { SettingsIcon } from "lucide-react";
import type { PackageData } from "@/actions/package/get";
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
import { GitHub } from "./github";
import { GroupingSelector } from "./grouping-selector";
import { Logo } from "./logo";
import { Screenshot } from "./screenshot";
import { ThemeToggle } from "./theme-toggle";
import { TimeRangeSelector } from "./time-range-selector";
import { Button } from "./ui/button";

type HeaderProps = {
  data?: PackageData[];
};

export const Header = ({ data }: HeaderProps) => (
  <header className="flex items-center justify-between">
    <Logo />
    <div className="flex items-center gap-2">
      <TimeRangeSelector className="hidden sm:flex" />
      <GroupingSelector className="hidden sm:flex" />

      <Drawer>
        <DrawerTrigger asChild>
          <Button className="sm:hidden" size="icon-sm" variant="outline">
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

      <Screenshot className="hidden sm:flex" data={data} />
      <ThemeToggle />
      <GitHub />
    </div>
  </header>
);
