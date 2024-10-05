import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { VideoPreview } from "@/ui/components/video/video-preview";

export const Route = createFileRoute("/_authenticated/watch/$")({
  component: Component,
});

const routeApi = getRouteApi("/_authenticated/watch/$");

function Component() {
  const { _splat } = routeApi.useParams();
  return <VideoPreview url={`https://${_splat}`} />;
}
