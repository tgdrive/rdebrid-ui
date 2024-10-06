import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";

import IndexRouter from "./routes";

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

export default app;
