import { PackageOpenIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export const Logo = () => (
  <Button asChild size="sm" variant="ghost">
    <Link className="flex items-center gap-2" href="/">
      <PackageOpenIcon className="size-4" />
      <p>npm.bet</p>
    </Link>
  </Button>
);
