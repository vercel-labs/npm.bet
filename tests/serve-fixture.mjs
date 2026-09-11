import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import next from "next";

if (process.env.NODE_ENV === "production") {
  throw new Error("Fixture server is development-only");
}

const fixture = JSON.parse(
  readFileSync(
    new URL("./fixtures/download-gaps.json", import.meta.url),
    "utf8"
  )
);
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname === "api.npmjs.org") {
    const pkg = fixture.packages.find(
      (item) =>
        url.pathname ===
        `/downloads/range/${item.start}:${item.end}/${item.package}`
    );
    if (!pkg) {
      throw new Error(`No frozen response for ${url.pathname}`);
    }
    console.info(`Frozen npm response: ${pkg.package}`);
    return Promise.resolve(Response.json(pkg));
  }
  return originalFetch(input, init);
};

const port = Number(process.env.PORT || 3001);
const app = next({
  dev: true,
  webpack: true,
  dir: process.cwd(),
  hostname: "127.0.0.1",
  port,
});
await app.prepare();
const handle = app.getRequestHandler();
createServer((request, response) => handle(request, response)).listen(
  port,
  "127.0.0.1",
  () => {
    console.info(`Frozen-data preview: http://localhost:${port}`);
  }
);
