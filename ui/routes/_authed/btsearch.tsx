import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import { Icons } from "@/ui/utils/icons";

import type { Selection } from "@nextui-org/react";
import { BtSearchList } from "@/ui/components/btsearch-list";
import { btSearchItemsQueryOptions } from "@/ui/utils/queryOptions";
import { valibotSearchValidator } from "@tanstack/router-valibot-adapter";
import { btdigParamsSchema } from "@/ui/utils/schema";
import { useIsFetching } from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/btsearch")({
  component: Component,
  validateSearch: valibotSearchValidator(btdigParamsSchema),
  loaderDeps: ({ search }) => search,
  meta: ({ match }) => [
    {
      title: match.search.q,
    },
  ],
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(btSearchItemsQueryOptions(deps));
  },
});

const SearchInput = () => {
  const { q } = Route.useSearch();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const isFetching = useIsFetching({ queryKey: ["btsearch"] });

  const onSubmit = useCallback(
    (e: React.BaseSyntheticEvent) => {
      e.preventDefault();
      navigate({
        to: "/btsearch",
        search: (prev) => ({ ...prev, q: search }),
      });
    },
    [search],
  );

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: [
            "bg-white/5 group-data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/5",
            "rounded-full",
          ],
          input: "text-sm",
        }}
        defaultValue={q || ""}
        labelPlacement="outside"
        placeholder="Search..."
        isClearable
        onClear={() => setSearch("")}
        startContent={
          <div>{isFetching ? <Icons.Refresh className="animate-spin" /> : <Icons.Search />}</div>
        }
        type="search"
        onChange={(e) => setSearch(e.target.value.trim())}
      />
    </form>
  );
};

const categoriesList = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movie" },
  { value: "audio", label: "Audio" },
  { value: "doc", label: "Document" },
  { value: "app", label: "Application" },
  { value: "other", label: "Other" },
];

const sortOderList = [
  { value: "time", label: "CreatedAt" },
  { value: "size", label: "Size" },
  { value: "seeders", label: "Seeders" },
  { value: "relevance", label: "Relevance" },
];

const CategorySelect = () => {
  const { category } = Route.useSearch();

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([category || "all"]));

  const navigate = useNavigate();

  const onSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedKeys(keys);
      navigate({
        to: "/btsearch",
        search: (prev) => ({ ...prev, category: Array.from(keys)[0] as any }),
        replace: true,
      });
    },
    [setSelectedKeys],
  );

  return (
    <Dropdown
      placement="bottom-end"
      classNames={{
        content: "!bg-radial-1 bg-background",
      }}
    >
      <DropdownTrigger>
        <Button title="Category" variant="flat" className="bg-white/5" isIconOnly>
          <Icons.Catergory />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Category"
        itemClasses={{
          base: ["data-[hover=true]:bg-white/5", "data-[selectable=true]:focus:bg-white/5"],
        }}
        disallowEmptySelection
        selectionMode="single"
        items={categoriesList}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <DropdownItem key={item.value} className="capitalize">
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

const SortBySelect = () => {
  const { orderBy } = Route.useSearch();

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([orderBy || "relevance"]));

  const navigate = useNavigate();

  const onSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedKeys(keys);
      navigate({
        to: "/btsearch",
        search: (prev) => ({ ...prev, orderBy: Array.from(keys)[0] as any }),
        replace: true,
      });
    },
    [setSelectedKeys],
  );

  return (
    <Dropdown
      placement="bottom-end"
      classNames={{
        content: "!bg-radial-1 bg-background",
      }}
    >
      <DropdownTrigger>
        <Button title="Order By" variant="flat" className="bg-white/5" isIconOnly>
          <Icons.Sort />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Order By"
        itemClasses={{
          base: ["data-[hover=true]:bg-white/5", "data-[selectable=true]:focus:bg-white/5"],
        }}
        disallowEmptySelection
        selectionMode="single"
        items={sortOderList}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <DropdownItem key={item.value} className="capitalize">
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
function Component() {
  return (
    <div className="grid grid-rows-[auto_auto_1fr] gap-4 size-full">
      <div className="flex gap-4 px-2 w-full md:w-1/2 mx-auto">
        <SearchInput />
        <CategorySelect />
        <SortBySelect />
      </div>
      <BtSearchList />
    </div>
  );
}
