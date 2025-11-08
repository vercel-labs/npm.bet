import type { PackageData } from "@/actions/package/get";
import { GroupingSelector } from "./grouping-selector";
import { Logo } from "./logo";
import { Screenshot } from "./screenshot";
import { TimeRangeSelector } from "./time-range-selector";

type HeaderProps = {
  data?: PackageData[];
};

export const Header = ({ data }: HeaderProps) => (
  <header className="flex items-center justify-between">
    <Logo />
    <div className="flex items-center gap-2">
      <TimeRangeSelector />
      <GroupingSelector />
      {data && data.length > 0 && <Screenshot data={data} />}
    </div>
  </header>
);
