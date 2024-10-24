import type { HonoBinding } from "@/types";
import { Hono } from "hono";
import {
  fallback,
  object,
  picklist,
  string,
  safeParse,
  pipe,
  transform,
} from "valibot";
import axios, { isAxiosError } from "feaxios";
import { XMLParser } from "fast-xml-parser";
import { verifyAuth } from "@hono/auth-js";

type RssFeedResponse = {
  rss: {
    channel: {
      title: string;
      description: string;
      link: string;
      item?: Array<{
        title: string;
        link: string;
        guid: string;
        pubDate: string;
        description: string;
      }>;
    };
  };
};

const QuerySchema = object({
  q: string(),
  orderBy: fallback(
    picklist(["time", "size", "seeders", "relevance"]),
    "relevance"
  ),
  category: fallback(
    picklist(["all", "movie", "audio", "doc", "app", "other"]),
    "all"
  ),
  page: fallback(pipe(string(), transform(Number)), 1),
});

function formatToUTC(dateString: string): string {
  const parsedDate = new Date(dateString);
  const utcYear: number = parsedDate.getUTCFullYear();
  const utcMonth: string = (parsedDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0");
  const utcDay: string = parsedDate.getUTCDate().toString().padStart(2, "0");
  const utcHours: string = parsedDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes: string = parsedDate
    .getUTCMinutes()
    .toString()
    .padStart(2, "0");
  const utcSeconds: string = parsedDate
    .getUTCSeconds()
    .toString()
    .padStart(2, "0");
  const utcDateString: string = `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}:${utcSeconds}Z`;

  return utcDateString;
}

function removeTrackersFromMagnet(magnetLink: string): string {
  const url = new URL(magnetLink);

  if (url.protocol !== "magnet:") {
    throw new Error("Not a valid magnet link");
  }

  const params = new URLSearchParams(url.search);
  params.forEach((_, key) => {
    if (key === "tr") params.delete(key);
  });
  const cleanedMagnetLink = `${url.protocol}${url.pathname}?${params.toString()}`;

  return decodeURIComponent(cleanedMagnetLink);
}

function extractTotalPages(input: string) {
  const regex = /Found\D+(\d+)\D+items/m;
  const match = input.match(regex);
  if (match) {
    return Number(match[1]);
  }
  return 0;
}

const router = new Hono<HonoBinding>({ strict: false });

router.get("/", verifyAuth(), async (c) => {
  const result = safeParse(QuerySchema, c.req.query());
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: result.issues,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { q, page, orderBy, category } = result.output;

  try {
    const fetchOptions = c.env.PROXY_URL
      ? {
          proxy: c.env.PROXY_URL,
        }
      : {};
    const reqPromises = [
      axios.get("https://bt4gprx.com/search", {
        params: {
          q,
          p: page,
          orderby: orderBy,
          category,
          page: "rss",
        },
        //@ts-ignore
        fetchOptions,
      }),
      axios.get("https://bt4gprx.com/search", {
        params: {
          q,
          category,
          orderby: orderBy,
        },
        //@ts-ignore
        fetchOptions,
      }),
    ];
    const responses = await Promise.all(reqPromises);

    const totalCount = extractTotalPages(responses[responses.length - 1].data);

    const parser = new XMLParser();
    const obj = parser.parse(responses[0].data) as RssFeedResponse;

    if (obj.rss.channel.item && !Array.isArray(obj.rss.channel.item)) {
      obj.rss.channel.item = [obj.rss.channel.item];
    }
    const data = obj.rss.channel.item?.map((item) => ({
      title: item.title,
      magnet: removeTrackersFromMagnet(item.link),
      link: item.guid,
      createdAt: formatToUTC(item.pubDate),
      size: item.description.split("<br>")[1],
    }));

    return c.json({
      torrents: data || [],
      meta: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / 15),
      },
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return c.json({
        torrents: [],
        meta: {},
      });
    }
    throw error;
  }
});

export default router;
