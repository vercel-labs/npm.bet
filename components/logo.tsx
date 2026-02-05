import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "./ui/button";

const VercelLogo = (props: ComponentProps<"svg">) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 76 65"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Vercel</title>
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
  </svg>
);

export const Logo = () => (
  <Button asChild size="sm" variant="ghost">
    <Link className="flex items-center gap-2" href="/">
      <VercelLogo className="size-4" />
      <span className="pointer-events-none select-none text-muted-foreground opacity-50">
        /
      </span>
      <p>npm.bet</p>
    </Link>
  </Button>
);
