"use server";

import { Redis } from "@upstash/redis";
import { after } from "next/server";

const redis = Redis.fromEnv();
const isDevelopment = process.env.NODE_ENV === "development";

export type NpmPackage = {
  package: {
    name: string;
    version: string;
    description: string;
    links: {
      npm: string;
    };
  };
  score: {
    final: number;
  };
};

export type NpmSearchResponse = {
  objects: NpmPackage[];
  total: number;
};

const CACHE_TTL_SECONDS = 3600; // 1 hour

export const searchPackages = async (
  query: string
): Promise<NpmSearchResponse> => {
  const cacheKey = `search:${query.toLowerCase()}`;

  // Try to get from cache first (skip in development)
  if (!isDevelopment) {
    const cached = await redis.get<NpmSearchResponse>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Cache miss - fetch from npm registry
  const response = await fetch(
    `https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(query)}&size=10`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch packages");
  }

  const data: NpmSearchResponse = await response.json();

  // Store in cache with TTL (async, after response, skip in development)
  if (!isDevelopment) {
    after(() => {
      redis.setex(cacheKey, CACHE_TTL_SECONDS, data);
    });
  }

  return data;
};
