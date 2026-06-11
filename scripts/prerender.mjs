/**
 * Post-build prerender.
 *
 * Vite ships a client-only SPA (empty <div id="root">), so crawlers that don't
 * run JavaScript see no content. This script serves the built `dist/` folder,
 * loads each route in headless Chromium, lets React + animations settle, then
 * writes the fully rendered HTML back to disk. The client still hydrates/render
 * on top of it as usual — but search engines now get real markup immediately.
 *
 * It is intentionally non-fatal: if anything goes wrong (e.g. Chromium can't
 * launch in CI), it logs a warning and exits 0 so the SPA still deploys.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const ROUTES = ["/", "/politika-privatnosti", "/uvjeti-koristenja"];

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

async function main() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.warn("[prerender] puppeteer not installed — skipping, shipping SPA as-is.");
    return;
  }

  // Minimal static server with SPA fallback to index.html for unknown routes.
  const indexHtml = await readFile(join(DIST, "index.html"));
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = join(DIST, urlPath);
    if (existsSync(filePath) && extname(filePath)) {
      const body = await readFile(filePath);
      res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
      res.end(body);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexHtml);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      // Render the Croatian default so crawlers index the primary market.
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "language", { get: () => "hr-HR" });
        Object.defineProperty(navigator, "languages", { get: () => ["hr-HR", "hr"] });
      });

      await page.goto(base + route, { waitUntil: "load", timeout: 30000 });
      await page.waitForSelector("#root h1, #root h2", { timeout: 15000 });

      // Scroll through the page so whileInView animations finish (otherwise the
      // captured markup keeps the initial opacity:0 state on lower sections).
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = window.innerHeight / 2;
          const timer = setInterval(() => {
            window.scrollTo(0, y);
            y += step;
            if (y > document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              setTimeout(resolve, 600);
            }
          }, 100);
        });
      });

      const html = "<!doctype html>\n" + (await page.evaluate(() => document.documentElement.outerHTML));
      const outDir = route === "/" ? DIST : join(DIST, route);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "index.html"), html);
      console.log(`[prerender] ${route} -> ${join(outDir, "index.html").replace(DIST, "dist")}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.warn("[prerender] skipped due to error:", err?.message || err);
  process.exit(0);
});
