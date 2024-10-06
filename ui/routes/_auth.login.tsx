import { memo, useCallback } from "react";
import { signIn } from "@hono/auth-js/react";
import { Button } from "@nextui-org/react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { loginQuery } from "@/ui/utils/schema";
import { buttonClasses } from "@/ui/utils/classes";

export const Logincomponent = memo(() => {
  const params = useSearch({ from: "/_auth/login" });

  const handleLogin = useCallback(() => {
    signIn("real-debrid", { callbackUrl: `${window.location.origin}${params.redirect ?? "/"}` });
  }, [params.redirect]);

  return (
    <div className="pt-16">
      <div className="m-auto flex h-48 max-w-sm flex-row  justify-center bg-background rounded-lg shadow-lg">
        <div className="m-auto">
          <Button onPress={handleLogin} className={buttonClasses}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
});

export const Route = createFileRoute("/_auth/login")({
  component: Logincomponent,
  validateSearch: (search) => loginQuery.parse(search),
});
