import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/watch/$")({
  meta: ({ params }) => [
    {
      title: params._splat?.split("/").pop(),
    },
  ],
})

