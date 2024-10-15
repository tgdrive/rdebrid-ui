import { type Key, useCallback, useEffect, useRef, type MouseEvent } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { btSearchItemsQueryOptions, debridTorrentQueryOptions } from "@/ui/utils/queryOptions";
import { useSearch } from "@tanstack/react-router";
import { scrollClasses } from "@/ui/utils/classes";
import { useInView } from "framer-motion";
import { Icons } from "@/ui/utils/icons";
import { copyDataToClipboard, formattedLongDate } from "@/ui/utils/common";
import clsx from "clsx";
import { useDebridStore, useSelectModalStore } from "@/ui/utils/store";
import { getQueryClient } from "../utils/queryClient";
import http from "@/ui/utils/http";

const ControlDropdown = () => {
  const { open, cords } = useDebridStore((state) => state.dropdown);
  const { closeDropdown } = useDebridStore((state) => state.actions);
  const item = useDebridStore((state) => state.currentBtTorrent)!;
  const actions = useSelectModalStore((state) => state.actions);

  const onAction = useCallback(
    async (key: Key) => {
      if (key === "add") {
        const res = (
          await http.postForm<{ id: string }>("/debrid/torrents/addMagnet", {
            magnet: item.magnet,
          })
        ).data;

        const torrent = await getQueryClient().ensureQueryData(debridTorrentQueryOptions(res.id));
        actions.setCurrentItem(torrent);
        actions.setOpen(true);
      } else if (key === "availability") {
        // console.log("Check availability");
      } else if (key === "copy") {
        copyDataToClipboard(item.magnet);
      }
    },
    [item],
  );
  return (
    <Dropdown
      isOpen={open}
      onOpenChange={closeDropdown}
      classNames={{
        content: "!bg-radial-1 bg-background",
      }}
    >
      <DropdownTrigger>
        <button type="button" className="fixed" style={{ top: cords.y, left: cords.x }} />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Options"
        itemClasses={{
          base: ["data-[hover=true]:bg-white/5", "data-[selectable=true]:focus:bg-white/5"],
        }}
        onAction={onAction}
      >
        <DropdownItem key="add">Add Torrent</DropdownItem>
        <DropdownItem key="availability">Check Availability</DropdownItem>
        <DropdownItem as={"a"} rel="noopener noreferrer" href={item?.magnet} key="open">
          Open Magnet
        </DropdownItem>
        <DropdownItem key="copy">Copy Magnet</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export function BtSearchList() {
  const search = useSearch({ from: "/_authed/btsearch" });

  const { data, hasNextPage, fetchNextPage, isSuccess } = useInfiniteQuery(
    btSearchItemsQueryOptions(search),
  );

  const torrents = data?.pages.flatMap((page) => page.torrents) ?? [];

  const loadingRef = useRef<HTMLDivElement | null>(null);

  const inView = useInView(loadingRef, {
    amount: "some",
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage]);

  const actions = useDebridStore((state) => state.actions);

  const onDropDownOpen = useCallback((e: MouseEvent, item: any) => {
    e.stopPropagation();
    actions.openDropdown();
    actions.setDropdownCords({ x: e.clientX, y: e.clientY });
    actions.setCurrentBtTorrent(item);
  }, []);

  return (
    <>
      <div className="flex">
        {data?.pages?.[0].meta?.total && (
          <p className="px-4 py-1 text-medium">{data.pages?.[0].meta.total || 0} items</p>
        )}
      </div>
      {!search.q && (
        <p
          className={clsx(
            "text-center text-lg text-zinc-400",
            "absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          )}
        >
          Search Torrent Index
        </p>
      )}
      {!!search.q && isSuccess && (
        <>
          <ControlDropdown />
          <Listbox
            classNames={{
              base: ["overflow-auto", scrollClasses],
              list: "gap-4",
            }}
            items={torrents}
            selectionMode="none"
            variant="flat"
            emptyContent={<p className="text-center text-lg">No torrents found</p>}
            bottomContent={
              <div ref={loadingRef} className="size-full flex items-center justify-center p-2">
                {hasNextPage && <Icons.Loading />}
              </div>
            }
          >
            {(item) => (
              <ListboxItem
                classNames={{
                  base: "rounded-3xl data-[hover=true]:bg-white/5",
                }}
                key={item.magnet}
                textValue={item.title}
              >
                <div className="grid gap-x-4 gap-y-1 md:gap-y-0 cursor-pointer grid-cols-6 rounded-3xl p-2">
                  <div className="col-span-6 sm:col-span-4 items-center">
                    <p title={item.title} className="text-base truncate">
                      {item.title}
                    </p>
                  </div>

                  <div className="flex sm:ml-auto col-span-2">
                    <Button
                      disableRipple
                      variant="light"
                      title={"Options"}
                      isIconOnly
                      onClick={(e) => onDropDownOpen(e, item)}
                      className="data-[hover=true]:bg-transparent"
                    >
                      <Icons.DotsVertical />
                    </Button>
                  </div>

                  <div className="col-span-4 items-center flex ml-auto sm:ml-0">
                    <p className="text-sm text-zinc-400 min-w-20">{item.size}</p>
                    <p className="text-sm text-zinc-400">{formattedLongDate(item.createdAt)}</p>
                  </div>
                </div>
              </ListboxItem>
            )}
          </Listbox>
        </>
      )}
    </>
  );
}
