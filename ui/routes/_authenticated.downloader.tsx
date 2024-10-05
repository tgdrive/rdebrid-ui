import { createFileRoute } from "@tanstack/react-router";
import { DownloadPage } from "@/ui/components/download/download-page";

export const Route = createFileRoute("/_authenticated/downloader")({
  component: DownloadPage,
});
