"use client";

import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { useTimeRange } from "@/providers/filters";
import { ChartAreaInteractive } from "./chart";
import { ChartLoading } from "./chart-loading";
import { EmptyState } from "./empty-state";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type MainProps = {
  packageName?: string;
};

export const Main = ({ packageName }: MainProps) => {
  const [timeRange] = useTimeRange();

  const { data: packageData, error } = useSWR<PackageData>(
    packageName ? [packageName, timeRange] : null,
    ([pkg, range]: [string, string]) =>
      getPackageData(pkg as string, range as string)
  );

  if (!packageName) {
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
