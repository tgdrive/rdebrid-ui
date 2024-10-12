import type { AuthConfig } from "@hono/auth-js";
import type { Context } from "hono";
import RealDebrid from "./debrid-auth";

export function getAuthConfig(c: Context): AuthConfig {
  return {
    providers: [RealDebrid],
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
      async jwt({ token, account }) {
        if (account) {
          return {
            ...token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            refresh_token: account.refresh_token,
          };
        }
        if (Date.now() < token.expires_at * 1000) {
          return token;
        }
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

        try {
          const response = await fetch("https://api.real-debrid.com/oauth/v2/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: c.env.AUTH_REAL_DEBRID_ID,
              client_secret: c.env.AUTH_REAL_DEBRID_SECRET,
              code: token.refresh_token as string,
              grant_type: "http://oauth.net/grant_type/device/1.0",
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(Date.now() / 1000 + newTokens.expires_in);
          if (newTokens.refresh_token) {
            token.refresh_token = newTokens.refresh_token;
          }
          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "RefreshTokenError";
          return token;
        }
      },
    },
  };
}
