import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, ScrollRestoration } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <div className="fixed inset-0 bg-radial" />
      <ScrollRestoration />
      <Outlet />
    </>
  ),
});
