"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch } from "@/components/package-search";

interface PackageFooterProps {
  packages: string[];
}

export const PackageFooter = ({ packages }: PackageFooterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePackagesChange = (nextPackages: string[]) => {
    const pathname =
      nextPackages.length > 0
        ? `/${nextPackages.map(encodeURIComponent).join(",")}`
        : "/";
    const query = searchParams.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <footer className="flex items-center justify-center p-4">
      <PackageSearch
        onPackagesChange={handlePackagesChange}
        packages={packages}
      />
    </footer>
  );
};
