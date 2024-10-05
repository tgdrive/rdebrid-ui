import type React from "react";
import { memo, useEffect, useRef } from "react";
import { Button } from "@nextui-org/react";

import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
import FlatColorIconsVlc from "~icons/flat-color-icons/vlc";
import type { Artplayer, Option, AspectRatio } from "@artplayer/player";
import Player from "./artplayer";

const aspectRatioes = ["default", "4:3", "16:9"];

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  videoUrl: string;
  poster?: string;
  style?: React.CSSProperties;
}
const VideoPlayer = ({ videoUrl, style = {}, ...props }: VideoPlayerProps) => {
  const artInstance = useRef<Artplayer | null>(null);
  const artOptions: Option = {
    container: "",
    url: "",
    volume: 0.6,
    muted: false,
    autoplay: true,
    pip: true,
    autoSize: false,
    autoMini: true,
    screenshot: true,
    setting: true,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    fullscreen: true,
    fullscreenWeb: true,
    mutex: true,
    backdrop: true,
    hotkey: true,
    playsInline: true,
    autoPlayback: true,
    airplay: true,
    lock: true,
    fastForward: true,
    autoOrientation: true,
    moreVideoAttr: {
      playsInline: true,
    },
  };

  useEffect(() => {
    if (artInstance?.current && videoUrl) {
      artInstance.current.switchUrl(videoUrl);
    }
    return () => {
      if (artInstance.current) {
        artInstance.current.video.pause();
        artInstance.current.video.removeAttribute("src");
        artInstance.current.video.load();
      }
    };
  }, [videoUrl]);

  return (
    <Player
      {...props}
      style={style}
      option={artOptions}
      getInstance={(art) => {
        artInstance.current = art;
        art.hotkey.add(65, (_: Event) => {
          art.aspectRatio = aspectRatioes[
            (aspectRatioes.findIndex((val) => val === art.aspectRatio) + 1) % aspectRatioes.length
          ] as AspectRatio;
        });
      }}
    />
  );
};

export const VideoPreview = memo(({ url }: { url: string }) => {
  return (
    <div className="relative mx-auto mt-4 max-w-4xl">
      <VideoPlayer className="aspect-[16/9]" videoUrl={url} />
      <div className="flex relative flex-col mt-4 gap-4">
        <div className="grid grid-cols-6 gap-y-2">
          <h1 className="text-base sm:text-xl lg:text-2xl mr-auto font-medium col-span-full md:col-span-4">
            {url.split("/").pop()}
          </h1>
          <div className="inline-flex gap-2 relative col-span-full md:col-span-2 ml-auto">
            <Button
              as="a"
              title="Open in PotPlayer"
              isIconOnly
              variant="light"
              rel="noopener noreferrer"
              href={`potplayer://${url}`}
            >
              <SolarPlayCircleBold />
            </Button>
            <Button
              as="a"
              title="Open in VLC"
              isIconOnly
              variant="light"
              rel="noopener noreferrer"
              href={`vlc://${url}`}
            >
              <FlatColorIconsVlc />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
VideoPreview.displayName = "VideoPreview";
