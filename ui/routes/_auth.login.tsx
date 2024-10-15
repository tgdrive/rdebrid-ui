import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { signIn } from "@hono/auth-js/react";
import { Button, Link } from "@nextui-org/react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { loginQuery } from "@/ui/utils/schema";
import { buttonClasses } from "@/ui/utils/classes";
import clsx from "clsx";
import http from "@/ui/utils/http";
import type { DebridCredentials, OauthData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Icons } from "@/ui/utils/icons";
import { CopyButton } from "../components/copy-button";

const DebridClientId = "X245A4XAIBGVM";

export const Logincomponent = memo(() => {
  const params = useSearch({ from: "/_auth/login" });

  const [startOnBoarding, setStartOnBoarding] = useState(false);

  const [oauthData, setOauthData] = useState<OauthData | null>(null);

  const handleOnboarding = useCallback(async () => {
    setStartOnBoarding(true);
    const res = await http.get<OauthData>(
      "/debrid/oauth/v2/device/code?client_id=X245A4XAIBGVM&new_credentials=yes",
    );
    setOauthData(res.data);
  }, []);

  const { data } = useQuery({
    enabled: startOnBoarding && !!oauthData,
    refetchInterval: 5000,
    queryKey: ["oauth", oauthData?.device_code],

    queryFn: async ({ signal }) => {
      return (
        await http.get<DebridCredentials>("/debrid/oauth/v2/device/credentials", {
          params: {
            client_id: DebridClientId,
            code: oauthData?.device_code,
          },
          signal,
          validateStatus: (status) => (status >= 200 && status < 299) || status === 403,
        })
      ).data;
    },
  });

  const credentials = useMemo(
    () =>
      data?.client_id
        ? `AUTH_REAL_DEBRID_ID=${data.client_id}\nAUTH_REAL_DEBRID_SECRET=${data.client_secret}`
        : "",
    [data?.client_id],
  );

  useEffect(() => {
    if (data?.client_id) setStartOnBoarding(false);
  }, [data?.client_id]);

  const handleLogin = useCallback(() => {
    signIn("real-debrid", { callbackUrl: `${window.location.origin}${params.redirect ?? "/"}` });
  }, [params.redirect]);

  return (
    <div className="pt-16">
      <div
        className={clsx(
          "m-auto flex items-center max-w-sm min-h-48 flex-col justify-center gap-4",
          "relative bg-radial-1 bg-background rounded-lg shadow-md p-4",
        )}
      >
        <Button fullWidth onPress={handleLogin} className={buttonClasses}>
          Sign In
        </Button>
        <Button
          fullWidth
          onPress={handleOnboarding}
          className={buttonClasses}
          isLoading={startOnBoarding}
        >
          Get Outh Credentials
        </Button>
        {startOnBoarding && oauthData && (
          <div className="w-full justify-center items-center flex flex-col gap-2">
            <p className="font-medium">Open Link to Complete Process</p>
            <Button
              as={Link}
              href={oauthData.direct_verification_url}
              target="_blank"
              className={buttonClasses}
              rel="noreferrer"
              endContent={<Icons.ExternalLink />}
            >
              Open
            </Button>
          </div>
        )}
        {data?.client_secret && (
          <div className="w-full justify-center items-center flex flex-col gap-2">
            <p className="font-medium">Oauth Credentials</p>
            <div className="w-full bg-default/40 rounded-md p-4 text-sm relative">
              <CopyButton
                value={credentials}
                className="absolute top-0 right-0 bg-transparent border-none"
              />
              <p>CLIENT_ID={data.client_id}</p>
              <p className="truncate">CLIENT_SECRET={data.client_secret}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const Route = createFileRoute("/_auth/login")({
  component: Logincomponent,
  validateSearch: (search) => loginQuery.parse(search),
});
