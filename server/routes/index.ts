import { getAuthConfig } from "@/server/utils/auth-config";
import { initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";

import AuthRouter from "./auth";
import DebridRouter from "./debrid";

const router = new Hono({ strict: false });

router.use("*", initAuthConfig(getAuthConfig));

router.route("/auth", AuthRouter);

router.route("/debrid", DebridRouter);

router.get("/cors", async (c) => {
  const link = c.req.query("link");
  if (!link) {
    return c.text("No link provided", 400);
  }
  const res = await fetch(link);
  return new Response(res.body, res);
});

export default router;
