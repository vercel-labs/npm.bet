import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { groupData } from "../.test-build/chart-utils.js";
import {
  interpolateZeroDownloads,
  parseZeroMode,
  prepareDownloadData,
} from "../.test-build/download-data.js";

const fixture = JSON.parse(
  readFileSync(
    new URL("./fixtures/download-gaps.json", import.meta.url),
    "utf8"
  )
);
const daily = (counts) =>
  counts.map((downloads, index) => ({
    day: `2026-09-${String(index + 1).padStart(2, "0")}`,
    downloads,
  }));
const values = (data) => data.map((item) => item.downloads);

describe("bounded zero interpolation", () => {
  test("fills one interior zero and preserves reported values", () => {
    const result = interpolateZeroDownloads(daily([1000, 0, 1200]));
    assert.deepEqual(values(result), [1000, 1100, 1200]);
    assert.equal(result[1].reportedDownloads, 0);
    assert.equal(result[1].estimated, true);
    assert.equal(result[0].estimated, false);
  });
  test("fills two consecutive days from original endpoints", () => {
    assert.deepEqual(
      values(interpolateZeroDownloads(daily([1000, 0, 0, 1600]))),
      [1000, 1200, 1400, 1600]
    );
  });
  test("rounds once and handles decreasing counts", () => {
    assert.deepEqual(
      values(interpolateZeroDownloads(daily([100, 0, 0, 51]))),
      [100, 84, 67, 51]
    );
  });
  for (const input of [
    [0, 100],
    [100, 0],
    [0, 0],
    [100, 0, 0, 0, 200],
    [0],
    [],
  ]) {
    test(`preserves ineligible series ${JSON.stringify(input)}`, () => {
      assert.deepEqual(values(interpolateZeroDownloads(daily(input))), input);
    });
  }
  test("never fills a missing calendar day", () => {
    const input = [
      { day: "2026-09-01", downloads: 100 },
      { day: "2026-09-03", downloads: 0 },
      { day: "2026-09-04", downloads: 200 },
    ];
    assert.deepEqual(values(interpolateZeroDownloads(input)), [100, 0, 200]);
  });
  test("does not mutate frozen input or positive values", () => {
    const input = Object.freeze(
      daily([100, 0, 200, 0, 400]).map(Object.freeze)
    );
    assert.deepEqual(
      values(interpolateZeroDownloads(input)),
      [100, 150, 200, 300, 400]
    );
    assert.deepEqual(values(input), [100, 0, 200, 0, 400]);
  });
  for (const count of [Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5]) {
    test(`rejects invalid count ${count}`, () => {
      assert.throws(
        () => interpolateZeroDownloads(daily([100, count, 200])),
        RangeError
      );
    });
  }
  for (const day of ["invalid", "2026-02-30", "2026-9-01"]) {
    test(`rejects invalid UTC date ${day}`, () => {
      assert.throws(
        () => interpolateZeroDownloads([{ day, downloads: 1 }]),
        RangeError
      );
    });
  }
  test("rejects duplicate and out-of-order dates", () => {
    const input = daily([100, 0, 200]);
    assert.throws(
      () => interpolateZeroDownloads([...input].reverse()),
      RangeError
    );
    assert.throws(
      () => interpolateZeroDownloads([input[0], input[0]]),
      RangeError
    );
  });
});

describe("data policy and grouping", () => {
  for (const mode of [
    null,
    undefined,
    "garbage",
    "reported",
    "ESTIMATED",
    true,
  ]) {
    test(`defaults invalid mode ${mode} to reported`, () =>
      assert.equal(parseZeroMode(mode), "reported"));
  }
  test("recognizes explicit opt-in", () =>
    assert.equal(parseZeroMode("estimated"), "estimated"));
  for (const grouping of ["day", "week", "month"]) {
    test(`reported ${grouping} matches existing grouping`, () => {
      const input = daily([1000, 0, 0, 1600]);
      assert.deepEqual(
        prepareDownloadData(input, grouping).map(({ date, downloads }) => ({
          date,
          downloads,
        })),
        groupData(input, grouping)
      );
    });
  }
  for (const grouping of ["week", "month"]) {
    test(`estimates before ${grouping} aggregation and preserves provenance`, () => {
      const result = prepareDownloadData(
        daily([1000, 0, 0, 1600]),
        grouping,
        "estimated"
      )[0];
      assert.equal(result.downloads, 5200);
      assert.equal(result.reportedDownloads, 2600);
      assert.equal(result.estimatedDays, 2);
    });
  }
  test("retains legitimate low-volume zeros by default", () => {
    assert.deepEqual(
      values(prepareDownloadData(daily([1, 0, 1]), "day")),
      [1, 0, 1]
    );
  });
  test("captured next gap is independent of positive react data", () => {
    const next = fixture.packages.find((pkg) => pkg.package === "next");
    const react = fixture.packages.find((pkg) => pkg.package === "react");
    const nextPoint = prepareDownloadData(
      next.downloads,
      "day",
      "estimated"
    ).find((p) => p.date === "2026-09-02");
    const reactPoint = prepareDownloadData(
      react.downloads,
      "day",
      "estimated"
    ).find((p) => p.date === "2026-09-02");
    assert.deepEqual(nextPoint, {
      date: "2026-09-02",
      downloads: 9_792_335,
      reportedDownloads: 0,
      estimatedDays: 1,
    });
    assert.deepEqual(reactPoint, {
      date: "2026-09-02",
      downloads: 31_679_775,
      reportedDownloads: 31_679_775,
      estimatedDays: 0,
    });
  });
});
