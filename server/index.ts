import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "dotenv";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { env } from "hono/adapter";
import path from "node:path";
import { fileURLToPath } from "node:url";

import IndexRouter from "./routes";

const isDev = process.env.NODE_ENV === "development";

config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

const app = new Hono({ strict: false }).basePath("/");

app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "x-auth-return-redirect", "Authorization"],
    maxAge: 86400,
  }),
);

app.use("/api/*", (c, next) => {
  c.env = env(c);
  return next();
});

app.route("/api", IndexRouter);

if (!isDev) {
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
}
export default app;
