import { memo, useCallback } from "react";
import { signIn } from "@hono/auth-js/react";
import { Button, Card, CardBody } from "@nextui-org/react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { loginQuery } from "@/ui/utils/schema";

export const Logincomponent = memo(() => {
  const params = useSearch({ from: "/_auth/login" });

  const handleLogin = useCallback(() => {
    signIn("real-debrid", { callbackUrl: `${window.location.origin}${params.redirect ?? "/"}` });
  }, [params.redirect]);

  return (
    <div className="pt-16">
      <Card className="m-auto flex h-48 max-w-sm flex-row  justify-center">
        <CardBody className="m-auto">
          <Button onPress={handleLogin} color="primary">
            Sign In
          </Button>
        </CardBody>
      </Card>
    </div>
  );
});

export const Route = createFileRoute("/_auth/login")({
  component: Logincomponent,
  validateSearch: (search) => loginQuery.parse(search),
});
