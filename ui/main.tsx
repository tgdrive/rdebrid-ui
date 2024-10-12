import * as React from "react";
import { TailwindIndicator } from "@/ui/components/tailwind-indicator";
import { getQueryClient } from "@/ui/utils/queryClient";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import { routeTree } from "./route-tree.gen";

import "./styles/globals.css";

const router = createRouter({
  routeTree,
  context: {
    queryClient: getQueryClient(),
  },
  defaultPreloadDelay: 300,
  defaultPreload: false,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={getQueryClient()}>
      <NextUIProvider>
        <Toaster position="bottom-right" />
        <RouterProvider router={router} />
        <TailwindIndicator />
      </NextUIProvider>
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>,
  );
}
