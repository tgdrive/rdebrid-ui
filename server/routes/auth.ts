import type { HonoBinding } from "@/types";
import { authHandler } from "@hono/auth-js";
import { Hono } from "hono";

const router = new Hono<HonoBinding>({ strict: false });

router.use("*", authHandler());

export default router;
