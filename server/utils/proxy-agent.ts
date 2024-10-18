import { ProxyAgent } from "undici";
import { getRuntimeKey } from "hono/adapter";

export function getProxyAgent(proxyUrl?: string) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && proxyUrl) {
    const { origin, username, password } = new URL(proxyUrl);
    const token = password
      ? `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
      : "";
    return new ProxyAgent({
      uri: origin,
      token,
    });
  }
}
