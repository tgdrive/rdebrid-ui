import { sessionQueryOptions } from "@/ui/utils/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react";

export const Route = createFileRoute("/_authed/auth/success")({
  component: Component
})

function Component() {
	const { data: session, status } = useQuery(sessionQueryOptions);
	useEffect(() => {
		if (status !== "pending" && window.opener) {
			if (session?.user) {
				window.opener.postMessage(
					{
						status: "success",
					},
					window.location.origin,
				)
			} else {
				window.opener.postMessage({
					status: "errored",
					error: "some error",
				}, window.location.origin);
			}
			window.close();
		}
	}, [session?.user, status]);

	return <p className="font-bold">Auth Success</p>;
}