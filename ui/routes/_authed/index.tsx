import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/")({
  component: () => (
    <Navigate
      from="/"
      to="/downloader/$tabId"
      params={{ tabId: "links" }}
      replace
    />
  ),
})
