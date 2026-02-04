"use client";

import { PackageSearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command } from "@/components/ui/command";

interface PackageFooterProps {
  packageName: string;
}

export const PackageFooter = ({ packageName }: PackageFooterProps) => (
  <footer className="flex items-center justify-center p-4">
    <div className="absolute bottom-4 left-1/2 w-full max-w-xs -translate-x-1/2 md:max-w-md">
      <Command className="w-full rounded-lg border">
        <div className="flex items-center gap-2 px-3 py-2">
          <PackageSearchIcon className="size-4 shrink-0 opacity-50" />
          <Badge variant="secondary">{packageName}</Badge>
        </div>
      </Command>
    </div>
  </footer>
);
