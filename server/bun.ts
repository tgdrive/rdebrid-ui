import app from "@/server/app";

export default {
  fetch: app.fetch,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
};
