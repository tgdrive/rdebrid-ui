import type { Optional } from "@/types";
import { z } from "zod";

export const loginQuery = z.object({
  redirect: z.string().optional(),
});

export const debridParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().default(50).optional(),
  type: z.enum(["torrents", "downloads"]).catch("torrents"),
});

export type DebridParams = Optional<z.infer<typeof debridParamsSchema>, "limit" | "type">;

export type LoginQuery = z.infer<typeof loginQuery>;
