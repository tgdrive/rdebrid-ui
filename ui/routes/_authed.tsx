import { Navbar } from "@/ui/components/navbar";
import { sessionQueryOptions } from "@/ui/utils/queryOptions";
import type { QueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  type ParsedLocation,
  redirect,
  useMatches,
} from "@tanstack/react-router";
import { useSelectModalStore } from "@/ui/utils/store";
import { FileSelectModal } from "@/ui/components/debrid-list";
import clsx from "clsx";
import { SideNav } from "@/ui/components/side-nav";
import { type ReactNode, useEffect } from "react";
import { scrollClasses } from "@/ui/utils/classes";

const checkAuth = async (queryClient: QueryClient, location: ParsedLocation, preload: boolean) => {
  if (preload) {
    return;
  }
  const session = await queryClient.ensureQueryData(sessionQueryOptions);
  if (!session) {
    redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
      throw: true,
    });
  }
};

export const Route = createFileRoute("/_authed")({
  component: AuthenticatedLayout,
  beforeLoad: ({ location, context: { queryClient }, preload }) =>
    checkAuth(queryClient, location, preload),
});
function AuthenticatedLayout() {
  const open = useSelectModalStore((state) => state.open);
  return (
    <div className="flex min-h-screen overflow-hidden">
      <div className="relative z-0 flex-1">
        <Navbar />
        <SideNav />
        <main
          className={clsx(
            "absolute left-0 right-0 md:bottom-0 md:left-20 bottom-20 top-20 max-w-screen-xl mx-auto overflow-y-auto",
            scrollClasses,
          )}
        >
          <Outlet />
        </main>
        {open && <FileSelectModal />}
      </div>
    </div>
  );
}
