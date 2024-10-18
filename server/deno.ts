import { serveStatic } from "hono/deno";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { logger } from "hono/logger";

import IndexRouter from "./routes";
import type { HonoBinding } from "@/types";
import { getProxyClient } from "./utils/proxy-deno";

declare module "hono" {
  interface ContextVariableMap {
    client?: Deno.HttpClient;
  }
}

const app = new Hono<HonoBinding>({ strict: false }).basePath("/");

app.use(logger());

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    maxAge: 86400,
  }),
);

app.use("/api/*", (c, next) => {
  c.env = env(c);
  return next();
});

app.use("/api/btsearch/*", async (c, next) => {
  const client = getProxyClient(c.env.PROXY_URL);
  c.set("client", client);
  await next();
  client?.close();
});

app.route("/api", IndexRouter);

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

Deno.serve({ port: Number(Deno.env.get("PORT")) || 8080, hostname: "0.0.0.0" }, app.fetch);
