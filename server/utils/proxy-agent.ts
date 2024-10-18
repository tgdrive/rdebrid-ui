import { ProxyAgent } from "undici";
import { getRuntimeKey } from "hono/adapter";

let proxyAgent: ProxyAgent | null = null;

function createProxyAgent(proxyUrl: string) {
  const url = new URL(proxyUrl);

  const token = `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`;

  const proxyAgent = new ProxyAgent({
    uri: url.origin,
    token,
  });

  return proxyAgent;
}

export function getProxyAgent(proxyUrl?: string) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && !proxyAgent && proxyUrl) proxyAgent = createProxyAgent(proxyUrl);

  return proxyAgent;
}
