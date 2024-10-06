import type {
  DebridTorrent,
  DebridUnlock,
  TorrentAvaliability,
  TorrentAvaliabilityResponse,
} from "@/types";
import http from "@/ui/utils/http";
import type { Session } from "@auth/core/types";
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DebridParams } from "./schema";
import pLimit from "p-limit";

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const res = await http.get<Session>(`${window.location.origin}/api/auth/session`);
    return res.data;
  },
  refetchInterval: 5 * 60 * 1000,
});

export const debridItemsQueryOptions = (params: DebridParams) =>
  queryOptions({
    queryKey: ["debrid", params],
    queryFn: async ({ signal }) => getDebridItems(params, signal),
    placeholderData: keepPreviousData,
    // refetchInterval: params.page === 1 && params.type === "torrents" ? 5 * 1000 : false,
  });

export const debridTorrentQueryOptions = (id?: string) =>
  queryOptions({
    queryKey: ["debrid", "torrents", id],
    queryFn: async ({ signal }) => getDebridTorrent(id!, signal),
    enabled: !!id,
    select: (data) => {
      const selectedFiles = data.files?.filter((file) => file.selected === 1) || [];
      for (let i = 0; i < selectedFiles.length; i++) {
        data.files![selectedFiles[i].id - 1].link = data.links[i];
      }
      return data;
    },
  });

export const debridUnlockTorrentOptions = (link: string, enabled = false) =>
  queryOptions({
    queryKey: ["debrid", "links", link],
    queryFn: async ({ signal }) => unlockDebridTorrent(link, signal),
    enabled,
  });

export const debridAvailabilityOptions = (magnet: string, enabled = false) =>
  queryOptions({
    queryKey: ["torrent", "availability", magnet],
    queryFn: async ({ signal }) => getTorrentAvaliability(magnet, signal),
    enabled,
  });

export const useDeleteDebrid = (
  view: "torrents" | "downloads",
  ids: string[],
  onSuccess?: () => Promise<void>,
) => {
  const queryClient = useQueryClient();
  const limit = pLimit(2);
  return useMutation({
    mutationFn: () => {
      return Promise.all(ids.map((id) => limit(() => http.delete(`/${view}/delete/${id}`))));
    },
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess();
        await queryClient.invalidateQueries({ queryKey: ["debrid"] });
      }
    },
    onSettled: () => {
      if (!onSuccess) {
        queryClient.invalidateQueries({ queryKey: ["debrid"] });
      }
    },
  });
};

export const useCreateDebrid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { fileId: string; ids: number[] }) => {
      return http.postForm(`/torrents/selectFiles/${payload.fileId}`, {
        files: payload.ids.join(","),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["debrid"] });
    },
  });
};

type DebridReponse<T> = T extends "torrents"
  ? { items: DebridTorrent[]; totalPages: number }
  : T extends "downloads"
    ? { items: DebridUnlock[]; totalPages: number }
    : never;

const getDebridItems = async (params: DebridParams, signal: AbortSignal) => {
  const res = await http.get(`/${params.type}`, {
    signal,
    params: { page: params.page, limit: params.limit || 50 },
  });
  const totalPages = Math.ceil(Number(res.headers.get("x-total-count")) / (params.limit || 50));
  return { items: res.data, totalPages } as DebridReponse<"torrents" | "downloads">;
};

const getDebridTorrent = async (id: string, signal: AbortSignal) => {
  const res = await http.get<DebridTorrent>(`/torrents/info/${id}`, {
    signal,
  });
  return res.data;
};

const unlockDebridTorrent = async (link: string, signal: AbortSignal) => {
  const res = await http.postForm<DebridUnlock>(
    "/unrestrict/link",
    { link },
    {
      signal,
    },
  );
  return res.data;
};

const getTorrentAvaliability = async (magnet: string, signal: AbortSignal) => {
  if (magnet.startsWith("magnet:")) {
    magnet = decodeURIComponent(magnet).split("btih:")[1].split("&")[0];
  }
  const res = await http.get<TorrentAvaliabilityResponse>(
    `/torrents/instantAvailability/${magnet}`,
    {
      signal,
    },
  );
  const availability = {} as TorrentAvaliability;
  Object.entries(res.data).forEach(([hash, value]) => {
    availability.hash = hash;
    Object.entries(value).forEach(([host, avaliabilities]) => {
      availability.host = host;
      availability.avaliabilities = avaliabilities.map((item) =>
        Object.entries(item).map(([key, value]) => {
          return { ...value, id: Number(key) };
        }),
      );
    });
  });
  return availability;
};
