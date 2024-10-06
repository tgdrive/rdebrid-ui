import type React from "react";
import { useEffect, useRef } from "react";

// import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
// import FlatColorIconsVlc from "~icons/flat-color-icons/vlc";
import type { Artplayer, Option, AspectRatio } from "@artplayer/player";
import Player from "./artplayer";

const aspectRatioes = ["default", "4:3", "16:9"];

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  poster?: string;
}
export const VideoPlayer = ({ url, ...props }: VideoPlayerProps) => {
  const artInstance = useRef<Artplayer | null>(null);
  const artOptions: Option = {
    container: "",
    url,
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
    mutex: true,
    backdrop: true,
    hotkey: true,
    autoPlayback: true,
    airplay: true,
    lock: true,
    fastForward: true,
    autoOrientation: true,
  };

  useEffect(() => {
    return () => {
      if (artInstance.current) {
        artInstance.current.video.pause();
        artInstance.current.video.removeAttribute("src");
        artInstance.current.video.load();
      }
    };
  }, []);

  return (
    <Player
      {...props}
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

VideoPlayer.displayName = "VideoPlayer";
