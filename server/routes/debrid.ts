import type { HonoBinding } from "@/types";
import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";

const router = new Hono<HonoBinding>({ strict: false });

const methods = ["PUT", "POST", "PATCH"];

router.use("*", verifyAuth());

router.use("*", async (c) => {
  const user = c.get("authUser").token;
  const url = new URL(c.req.url);
  url.host = "api.real-debrid.com";
  url.protocol = "https:";
  url.port = "";
  url.pathname = `/rest/1.0${url.pathname.replace("/api/debrid", "")}`;
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${user?.access_token}`);

  if (methods.find((method) => method === c.req.method)) {
    const body = await c.req.parseBody();
    const ip = c.req.header("CF-Connecting-IP") as string;
    if (ip) {
      body.ip = ip;
    }
    const res = await fetch(
      new Request(url.toString(), {
        method: c.req.method,
        headers,
        body: new URLSearchParams(body as Record<string, string>),
      }),
    );
    const resHeaders = new Headers(res.headers);
    resHeaders.delete("Content-Encoding");
    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  }

  const res = await fetch(url.toString(), {
    method: c.req.method,
    headers: headers,
  });
  const resHeaders = new Headers(res.headers);
  resHeaders.delete("Content-Encoding");
  return new Response(res.body, {
    status: res.status,
    headers: resHeaders,
  });
});

export default router;
