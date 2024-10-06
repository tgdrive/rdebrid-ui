import { useEffect, useRef } from "react";
import { Artplayer, type Option } from "@artplayer/player";
import "@artplayer/player/artplayer.css";

Artplayer.LOG_VERSION = false;
Artplayer.USE_RAF = true;
interface PlayerProps {
  option: Option;
  getInstance?: (instance: Artplayer) => void;
}

const Player = ({ option, getInstance, ...rest }: PlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current!,
    });

    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      if (art?.destroy) {
        art.destroy(false);
      }
    };
  }, []);

  return <div ref={artRef} {...rest} />;
};

export default Player;
