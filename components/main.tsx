"use client";

import { useAtomValue } from "jotai";
import useSWR from "swr";
import { timeRangeAtom } from "@/providers/filters";
import { ChartAreaInteractive } from "./chart";
import { EmptyState } from "./empty-state";

type MainProps = {
  packageName?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch package data");
  }

  return response.json();
};

export const Main = ({ packageName }: MainProps) => {
  const timeRange = useAtomValue(timeRangeAtom);

  const { data: packageData, error } = useSWR<{
    start: string;
    end: string;
    package: string;
    downloads: {
      downloads: number;
      day: string;
    }[];
  }>(
    packageName
      ? `https://api.npmjs.org/downloads/range/${timeRange}/${packageName}`
      : null,
    fetcher
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
      <main className="overflow-hidden">
        <div>Error loading package data</div>
      </main>
    );
  }

  if (!packageData) {
    return (
      <main className="overflow-hidden">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <ChartAreaInteractive data={packageData} />
    </main>
  );
};
