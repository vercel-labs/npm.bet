import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const Icon = theme === "dark" ? SunIcon : MoonIcon;

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      size="icon-sm"
      variant="outline"
    >
      <Icon className="size-4" />
    </Button>
  );
};
