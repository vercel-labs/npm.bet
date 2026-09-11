"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { zeroModes } from "@/lib/download-data";

export const useTimeRange = () =>
  useQueryState("timeRange", parseAsString.withDefault("last-year"));

export const useGrouping = () =>
  useQueryState("grouping", parseAsString.withDefault("week"));

export const usePackages = () =>
  useQueryState("q", parseAsArrayOf(parseAsString, ",").withDefault([]));

export const useMetric = () =>
  useQueryState("metric", parseAsString.withDefault("downloads"));

export const useZeroMode = () =>
  useQueryState(
    "zeroMode",
    parseAsStringLiteral(zeroModes)
      .withDefault("reported")
      .withOptions({ history: "push" })
  );
