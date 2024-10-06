import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { VideoPlayer } from "@/ui/components/video/video-player";

export const Route = createFileRoute("/_authenticated/watch/$")({
  component: Component,
  meta: ({ params }) => [
    {
      title: params._splat?.split("/").pop(),
    },
  ],
});

const routeApi = getRouteApi("/_authenticated/watch/$");

function Component() {
  const { _splat } = routeApi.useParams();
  return <VideoPlayer className="art-fullscreen-web z-50" url={`https://${_splat}`} />;
}
