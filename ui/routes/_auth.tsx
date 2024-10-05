import { Navbar } from "@/ui/components/navbar";
import { sessionQueryOptions } from "@/ui/utils/queryOptions";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: Layout,
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions);
    if (session) {
      redirect({
        to: "/",
        throw: true,
      });
    }
  },
});

function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
