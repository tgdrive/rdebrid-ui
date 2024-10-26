import type { Dispatch, SetStateAction } from "react";

export type HonoBinding = {
  Bindings: {
    DEBRID_TOKEN: string;
    FORWARD_IP: string;
    PROXY_URL: string;
  };
};

export type OauthData = {
  device_code: string;
  user_code: string;
  interval: number;
  expires_in: number;
  verification_url: string;
  direct_verification_url: string;
};

export type DebridCredentials = {
  client_id: string;
  client_secret: string;
  error?: string;
  error_code?: number;
};

export type DebridTorrentFile = {
  id: number;
  path: string;
  bytes: number;
  selected: 0 | 1;
  link?: string;
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

export type DebridUnlock = {
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
  error?: string;
  generated: string;
};

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

export type DebridFileNode = {
  fileId?: number;
  name: string;
  children: DebridFileNode[];
  selected: number;
  isFolder: boolean;
  path: string;
  link?: string;
};

export type BTorrent = BtSearchResponse["torrents"][0];

export type DebridItem = Nullish<BTorrent | DebridTorrent | DebridUnlock>;

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
  link?: string;
}

export type BtSearchResponse = {
  torrents: Array<{
    title: string;
    magnet: string;
    link: string;
    createdAt: string;
    size: string;
  }>;
  meta: {
    total: number;
    page: number;
    pages: number;
  };
};

export type DownloadTab = "links" | "torrents";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type SetValue<T> = Dispatch<SetStateAction<T>>;

export type Nullish<T> = T | null | undefined;
