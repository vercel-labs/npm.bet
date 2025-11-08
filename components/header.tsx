import { GroupingSelector } from "./grouping-selector";
import { Logo } from "./logo";
import { TimeRangeSelector } from "./time-range-selector";

export const Header = () => (
  <header className="flex items-center justify-between">
    <Logo />
    <div className="flex items-center gap-2">
      <TimeRangeSelector />
      <GroupingSelector />
    </div>
  </header>
);
