import DebridList from "@/ui/components/debrid-list"
import { debridItemsQueryOptions } from "@/ui/utils/queryOptions"
import { debridParamsSchema } from "@/ui/utils/schema"
import { createFileRoute } from "@tanstack/react-router"
import { capitalize } from "@/ui/utils/common"

export const Route = createFileRoute("/_authed/view")({
  component: DebridList,
  validateSearch: (search) => debridParamsSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  meta: ({ match }) => [
    {
      title: capitalize(match.search.type),
    },
  ],
  loader: ({ context: { queryClient }, deps: { search } }) =>
    queryClient.ensureQueryData(debridItemsQueryOptions(search)),
})
