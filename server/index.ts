import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import IndexRouter from "./routes";
import { getProxyAgent } from "./utils/proxy-agent";
import type { HonoBinding } from "@/types";
import type { ProxyAgent } from "undici";

config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

declare module "hono" {
  interface ContextVariableMap {
    proxyAgent?: ProxyAgent;
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
  const proxyAgent = getProxyAgent(c.env.PROXY_URL);
  c.set("proxyAgent", proxyAgent);
  await next();
  proxyAgent?.close();
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

serve({
  fetch: app.fetch,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
});
