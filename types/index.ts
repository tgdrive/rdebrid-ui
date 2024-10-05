import type { Dispatch, SetStateAction } from "react";

export type HonoBinding = {
  Bindings: {
    DEBRID_TOKEN: string;
  };
};

export type DebridTorrentFile = {
  id: number;
  path: string;
  bytes: number;
  selected: 0 | 1;
};

export interface DebridTorrent {
  id: string;
  filename: string;
  hash: string;
  bytes: number;
  original_bytes?: number;
  host: string;
  split: number;
  progress: number;
  status:
    | "magnet_error"
    | "magnet_conversion"
    | "waiting_files_selection"
    | "queued"
    | "downloading"
    | "downloaded"
    | "error"
    | "virus"
    | "compressing"
    | "uploading"
    | "dead";
  added: string;
  links: string[];
  files?: DebridTorrentFile[];
  ended: string;
  speed?: number;
  seeders?: number;
}

export interface DebridUnlock {
  id: string;
  filename: string;
  filesize: number;
  link: string;
  host: string;
  host_icon: string;
  chunks: number;
  crc: number;
  download: string;
  streamable: number;
  type: string;
  mimeType: string;
}

export type TorrentAvaliabilityResponse = {
  [key: string]: {
    [key: string]: Array<{
      [key: string]: {
        filename: string;
        filesize: number;
      };
    }>;
  };
};

export type TorrentAvaliability = {
  hash: string;
  host: string;
  avaliabilities: Array<
    Array<{
      filename: string;
      filesize: number;
      id: number;
    }>
  >;
};
export interface DebridTorrentResponse {
  items: DebridTorrent[];
  totalPages: number;
}

export interface FileNode {
  name: string;
  nodes?: FileNode[];
  id?: number;
}

export type DownloadTab = "links" | "torrents" | "avaliability";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type SetValue<T> = Dispatch<SetStateAction<T>>;

export type Nullish<T> = T | null | undefined;
