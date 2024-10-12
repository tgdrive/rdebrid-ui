import { createFileRoute } from "@tanstack/react-router"
import { VideoPlayer } from "@/ui/components/video/video-player"

export const Route = createFileRoute("/watch/$")({
  component: Component,
  meta: ({ params }) => [
    {
      title: params._splat?.split("/").pop(),
    },
  ],
})

function Component() {
  const { _splat } = Route.useParams()
  return (
    <VideoPlayer
      className="art-fullscreen-web z-50"
      url={`https://${_splat}`}
    />
  )
}
