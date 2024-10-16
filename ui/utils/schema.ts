import {
  string,
  optional,
  object,
  pipe,
  transform,
  fallback,
  picklist,
  type InferInput,
  number,
} from "valibot";

export const loginQuery = object({
  redirect: optional(string()),
});

export const debridParamsSchema = object({
  page: fallback(pipe(number(), transform(Number)), 1),
  limit: optional(fallback(pipe(number(), transform(Number)), 50)),
  type: fallback(picklist(["torrents", "downloads"]), "torrents"),
});

export const btdigParamsSchema = object({
  q: optional(string()),
  orderBy: optional(fallback(picklist(["time", "size", "seeders", "relevance"]), "relevance")),
  category: optional(fallback(picklist(["all", "movie", "audio", "doc", "app", "other"]), "all")),
  page: optional(fallback(pipe(number(), transform(Number)), 1)),
});

export type DebridParams = InferInput<typeof debridParamsSchema>;

export type LoginQuery = InferInput<typeof loginQuery>;

export type BtDigParams = InferInput<typeof btdigParamsSchema>;
