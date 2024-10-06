import { createFileRoute } from "@tanstack/react-router";
import { AddTorrent } from "@/ui/components/download/add-torrent";
import { CheckAvaliability } from "@/ui/components/download/check-avaliability";
import { UnRestrictLink } from "@/ui/components/download/unrestrict-link";
import type { DownloadTab } from "@/types";
import { memo } from "react";
import { debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { capitalize } from "@/ui/utils/common";

export const Route = createFileRoute("/_authenticated/downloader/$tabId")({
  component: memo(Component),
  validateSearch: (search: Record<string, unknown>) => search as { fileId?: string },
  loaderDeps: ({ search }) => ({ search }),
  meta: ({ params }) => [
    {
      title: capitalize(params.tabId),
    },
  ],
  loader: ({ context: { queryClient }, deps: { search }, params }) => {
    if (search.fileId && params.tabId === "links") {
      return queryClient.ensureQueryData(debridTorrentQueryOptions(search.fileId));
    }
  },
});

function Component() {
  const { tabId } = Route.useParams();

  switch (tabId as DownloadTab) {
    case "torrents":
      return <AddTorrent />;
    case "avaliability":
      return <CheckAvaliability />;
    case "links":
      return <UnRestrictLink />;
    default:
      return null;
  }
}
