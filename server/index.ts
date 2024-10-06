import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "@/server/app";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

app
  .use("*", async (c, next) => {
    await next();
    if (c.req.path.startsWith("/assets") || c.req.path.startsWith("/fonts")) {
      c.header("Cache-Control", "public, max-age=31536000");
    }
  })
  .use(
    "*",
    serveStatic({
      root: "./build/client",
    }),
  )
  .use(
    "*",
    serveStatic({
      path: "index.html",
      root: "./build/client",
    }),
  );

serve({
  fetch: app.fetch,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
});
