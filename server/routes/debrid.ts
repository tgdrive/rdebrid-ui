import type { HonoBinding } from "@/types";
import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";

const router = new Hono<HonoBinding>({ strict: false });

const methods = ["PUT", "POST", "PATCH"];
const apiHost = "api.real-debrid.com";
const apiProtocol = "https:";
const headersToDelete = [
  "content-encoding",
  "cache-control",
  "expires",
  "connection",
  "keep-alive",
  "vary",
];

const setResponseHeaders = (headers: Headers) => {
  const resHeaders = new Headers(headers);
  for (const k of headers.keys()) {
    const key = k.toLowerCase();
    if (
      key.startsWith("access-control-") ||
      (key.startsWith("x-") && key !== "x-total-count") ||
      headersToDelete.includes(key)
    )
      resHeaders.delete(k);
  }
  return resHeaders;
};

const fetchApiResponse = async (url: string, options: RequestInit) => {
  const res = await fetch(url, options);
  return new Response(res.body, {
    status: res.status,
    headers: setResponseHeaders(res.headers),
  });
};

router.get("/oauth/*", async (c) => {
  const url = new URL(c.req.url);
  url.host = apiHost;
  url.protocol = apiProtocol;
  url.port = "";
  url.pathname = url.pathname.replace("/api/debrid", "");

  return fetchApiResponse(url.toString(), { method: c.req.method });
});

router.use("*", verifyAuth(), async (c) => {
  const url = new URL(c.req.url);
  const user = c.get("authUser")?.token;
  url.host = apiHost;
  url.protocol = apiProtocol;
  url.port = "";
  url.pathname = `/rest/1.0${url.pathname.replace("/api/debrid", "")}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${c.env.DEBRID_TOKEN || user?.access_token}`);

  if (
    methods.includes(c.req.method) &&
    c.req.header("content-type") !== "application/octet-stream"
  ) {
    const body = await c.req.parseBody();
    const ip = c.env.FORWARD_IP || c.req.header("CF-Connecting-IP");
    if (ip) body.ip = ip;

    const requestOptions = {
      method: c.req.method,
      headers,
      body: new URLSearchParams(body as Record<string, string>),
    };
    return fetchApiResponse(url.toString(), requestOptions);
  }

  const requestOptions = {
    method: c.req.method,
    headers,
    ...(methods.includes(c.req.method) && { body: c.req.raw.body, duplex: "half" }),
  };

  return fetchApiResponse(url.toString(), requestOptions);
});

export default router;
