"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { useGrouping, usePackages, useTimeRange } from "@/providers/filters";
import { ChartAreaInteractive } from "./chart";
import { ChartLoading } from "./chart-loading";
import { EmptyState } from "./empty-state";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export const Main = () => {
  const [timeRange] = useTimeRange();
  const [packages] = usePackages();
  const [grouping] = useGrouping();

  const { data: packageData, error } = useSWR<PackageData[]>(
    packages.length > 0 ? [packages, timeRange] : null,
    async ([pkgs, range]: [string[], string]) =>
      Promise.all(pkgs.map((pkg) => getPackageData(pkg, range)))
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (packages.length > 0) {
      document.title = `${packages.join(" vs ")} | npm.bet`;
      document
        .querySelector("meta[property='og:image']")
        ?.setAttribute(
          "content",
          `${window.location.origin}/og?q=${packages.join(",")}&timeRange=${timeRange}&grouping=${grouping}`
        );
    } else {
      document.title = "npm.bet";
      document
        .querySelector("meta[property='og:image']")
        ?.setAttribute("content", `${window.location.origin}/og`);
    }
  }, [packages, timeRange, grouping]);

  if (packages.length === 0) {
    return (
      <main className="overflow-hidden">
        <EmptyState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex size-full items-center justify-center overflow-hidden">
        <Alert
          className="max-w-md border-destructive bg-destructive/5"
          variant="destructive"
        >
          <AlertTitle>Error loading package data</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!packageData) {
    return (
      <main className="overflow-hidden">
        <ChartLoading />
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <ChartAreaInteractive data={packageData} />
    </main>
  );
};
