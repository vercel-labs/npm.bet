"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from "nuqs";

export const useTimeRange = () =>
  useQueryState("timeRange", parseAsString.withDefault("last-year"));

export const useGrouping = () =>
  useQueryState("grouping", parseAsString.withDefault("week"));

export const usePackages = () =>
  useQueryState("q", parseAsArrayOf(parseAsString, ",").withDefault([]));

export const useRemoveCurrentPeriod = () =>
  useQueryState("removeCurrentPeriod", parseAsBoolean.withDefault(true));
