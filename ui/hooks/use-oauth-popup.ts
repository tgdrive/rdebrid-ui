import { useEffect, useState, useCallback } from "react";
import { signIn } from "@hono/auth-js/react";

type WindowProps = {
  url: string;
  title: string;
  width: number;
  height: number;
};

type Status = "loading" | "success" | "errored";

type State = {
  status: Status;
  error?: string;
};

const createPopup = ({ url, title, height, width }: WindowProps) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const externalPopup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top}`,
  );
  return externalPopup;
};

interface PopupLoginOptions extends Partial<Omit<WindowProps, "url">> {
  onSuccess?: () => void;
  callbackUrl?: string;
}

export const useOauthPopupLogin = (
  provider: Parameters<typeof signIn>[0],
  options: PopupLoginOptions = {},
) => {
  const { width = 500, height = 500, title = "Signin", onSuccess, callbackUrl = "/" } = options;

  const [externalWindow, setExternalWindow] = useState<Window | null>();

  const [state, setState] = useState<State>({ status: "loading" });

  const popUpSignin = useCallback(async () => {
    const res = await signIn(provider, {
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setState({ status: "errored", error: res.error });
      return;
    }
    setExternalWindow(
      createPopup({
        url: res?.url as string,
        title,
        width,
        height,
      }),
    );
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<State>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.status) {
        setState(event.data);
        if (event.data.status === "success") {
          onSuccess?.();
        }
        externalWindow?.close();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      externalWindow?.close();
    };
  }, [externalWindow]);

  return { popUpSignin, ...state };
};
