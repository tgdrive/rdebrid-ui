import { getRuntimeKey } from "hono/adapter";

export function getProxyClient(proxyUrl?: string) {
  const runtime = getRuntimeKey();
  if (runtime === "deno" && proxyUrl) {
    const { origin, username, password } = new URL(proxyUrl);
    return Deno.createHttpClient({
      proxy: {
        url: origin,
        basicAuth: password ? { username, password } : undefined,
      },
    });
  }
}
