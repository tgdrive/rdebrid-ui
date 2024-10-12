import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  type ReactNode,
  ScrollRestoration,
  useMatches,
} from "@tanstack/react-router";
import { useEffect } from "react";

function Meta({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const meta = matches.at(-1)?.meta?.find((meta) => meta.title);

  useEffect(() => {
    document.title = meta?.title || "Real Debrid";
  }, [meta]);

  return children;
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <div className="fixed inset-0 bg-radial" />
      <ScrollRestoration />
      <Meta>
        <Outlet />
      </Meta>
    </>
  ),
});
