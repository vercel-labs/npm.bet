import { Filters } from "./filters";
import { Logo } from "./logo";

export const Header = () => (
  <header className="flex items-center justify-between">
    <Logo />
    <Filters />
  </header>
);
