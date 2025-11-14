"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export const useTimeRange = () =>
  useQueryState("timeRange", parseAsString.withDefault("last-year"));

export const useGrouping = () =>
  useQueryState("grouping", parseAsString.withDefault("week"));

export const usePackages = () =>
  useQueryState("q", parseAsArrayOf(parseAsString, ",").withDefault([]));
