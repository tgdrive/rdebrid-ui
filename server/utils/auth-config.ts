import type { AuthConfig } from "@hono/auth-js";
import type { Context } from "hono";
import RealDebrid from "./debrid-auth";

export function getAuthConfig(_: Context): AuthConfig {
  return {
    providers: [RealDebrid({})],
    pages: {
      signIn: "/login",
    },
    cookies: {
      sessionToken: {
        name: "debrid.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: true,
        },
      },
    },
    callbacks: {
      jwt({ token, account, profile }) {
        if (profile) {
          token.accessToken = account?.access_token as string;
          token.userName = profile.username as string;
        }
        return token;
      },
    },
  };
}
