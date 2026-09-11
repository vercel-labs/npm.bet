import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.PREVIEW_URL || "http://localhost:3001";
const circlePattern = /<circle /g;
const dataMarkerPattern = /<circle [^>]*><title>/g;
const params = new URLSearchParams({
  q: "react,react-dom,next",
  timeRange: "2026-08-25:2026-09-10",
  grouping: "day",
});

test("frozen preview preserves zero-mode semantics across exports", async () => {
  const get = async (path, extra = {}) => {
    const query = new URLSearchParams(params);
    for (const [key, value] of Object.entries(extra)) {
      query.set(key, value);
    }
    const response = await fetch(`${base}${path}?${query}`);
    assert.equal(response.status, 200, `${path}: ${response.status}`);
    return response;
  };
  const reported = await (await get("/svg")).text();
  const estimated = await (await get("/svg", { zeroMode: "estimated" })).text();
  assert.equal((reported.match(circlePattern) || []).length, 0);
  assert.equal((estimated.match(dataMarkerPattern) || []).length, 10);
  assert.ok(estimated.includes("9792335 downloads; 0 reported downloads"));
  assert.ok(estimated.includes("Includes estimated downloads"));
  assert.ok(!reported.includes("Includes estimated downloads"));
  assert.ok(!(estimated.includes("NaN") || estimated.includes("Infinity")));
  assert.equal(
    await (await get("/svg", { zeroMode: "invalid" })).text(),
    reported
  );

  const share = await (
    await get("/svg", { zeroMode: "estimated", metric: "share" })
  ).text();
  assert.equal((share.match(dataMarkerPattern) || []).length, 12);
  assert.ok(share.includes("share denominators include estimates"));
  assert.ok(share.includes("100%"));

  for (const path of ["/", "/react,react-dom,next"]) {
    const html = await (await get(path, { zeroMode: "estimated" })).text();
    assert.ok(html.includes("zeroMode=estimated"));
    assert.ok(html.includes("og:image"));
  }
  for (const metric of ["downloads", "share"]) {
    const response = await get("/og", { zeroMode: "estimated", metric });
    assert.ok(response.headers.get("content-type").includes("image/png"));
    const png = Buffer.from(await response.arrayBuffer());
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 628);
  }
});
