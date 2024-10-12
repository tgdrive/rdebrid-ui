import { createLazyFileRoute } from "@tanstack/react-router"
import { VideoPlayer } from "@/ui/components/video/video-player"

export const Route = createLazyFileRoute("/watch/$")({
  component: Component,
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
