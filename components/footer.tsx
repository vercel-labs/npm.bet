"use client";

import { usePackages } from "@/providers/filters";
import { PackageSearch } from "./package-search";

export const Footer = () => {
  const [packages, setPackages] = usePackages();

  return (
    <footer className="flex items-center justify-center p-4">
      <PackageSearch
        onPackagesChange={(nextPackages) => setPackages(nextPackages)}
        packages={packages}
      />
    </footer>
  );
};
