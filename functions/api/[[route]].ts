import app from "@/server"
import { handle } from "hono/cloudflare-pages"

export const onRequest = handle(app)
