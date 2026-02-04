"use client";

import useSWR from "swr";
import { getPackageData, type PackageData } from "@/actions/package/get";
import { ChartAreaInteractive } from "@/components/chart";
import { ChartLoading } from "@/components/chart-loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTimeRange } from "@/providers/filters";

interface ContentProps {
  packageName: string;
}

export const Content = ({ packageName }: ContentProps) => {
  const [timeRange] = useTimeRange();

  const { data, error } = useSWR<PackageData[]>(
    [packageName, timeRange],
    async ([pkg, range]: [string, string]) => [await getPackageData(pkg, range)]
  );

  if (error) {
    return (
      <main className="flex size-full items-center justify-center overflow-hidden">
        <Alert
          className="max-w-md border-destructive bg-destructive/5"
          variant="destructive"
        >
          <AlertTitle>Error loading package data</AlertTitle>
          <AlertDescription>
            Could not find package &quot;{packageName}&quot;.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="overflow-hidden">
        <ChartLoading />
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <ChartAreaInteractive data={data} />
    </main>
  );
};
