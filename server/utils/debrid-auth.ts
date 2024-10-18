import type { OAuthConfig, OAuthUserConfig, UserinfoEndpointHandler } from "@auth/core/providers";

export interface RealDebridProfile {
  id: number;
  username: string;
  email: string;
  points: number;
  locale: string;
  avatar: string;
  type: string;
  premium: number;
  expiration: string;
}

export default function RealDebrid<P extends RealDebridProfile>(
  options: OAuthUserConfig<P>,
): OAuthConfig<P> {
  return {
    id: "real-debrid",
    name: "real-debrid",
    type: "oauth",
    checks: ["state"],
    authorization: {
      url: "https://api.real-debrid.com/oauth/v2/auth",
    },
    token: "https://api.real-debrid.com/oauth/v2/token",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    userinfo: {
      url: "https://api.real-debrid.com/rest/1.0/user",
      async request({ tokens, provider }: UserinfoEndpointHandler) {
        const profile = await fetch(provider.userinfo?.url as URL, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "User-Agent": "authjs",
          },
        }).then(async (res) => await res.json());

        return profile;
      },
    },
    profile(profile) {
      return {
        id: `${profile.id}`,
        name: profile.username,
        email: profile.email,
        image: profile.avatar,
      };
    },
    options,
  };
}
