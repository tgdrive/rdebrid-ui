import type React from "react";
import { type Key, useCallback } from "react";
import type { DebridTorrent, SetValue } from "@/types";
import { copyDataToClipboard, formattedLongDate, size, size2round } from "@/ui/utils/common";
import { useDeleteDebrid } from "@/ui/utils/queryOptions";
import {
  Button,
  Checkbox,
  dataFocusVisibleClasses,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useDebridStore, useSelectModalStore } from "@/ui/utils/store";
import { Icons } from "@/ui/utils/icons";
import { scrollClasses } from "@/ui/utils/classes";
import { ListBox, ListBoxItem } from "react-aria-components";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";
import type { Selection } from "@nextui-org/react";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";

const TorrentDropdown = () => {
  const { open, cords, item, actions } = useDebridStore(
    useShallow((state) => ({
      open: state.dropdown.open,
      cords: state.dropdown.cords,
      item: state.currentDebridItem as DebridTorrent,
      actions: state.actions,
    })),
  );

  const modalActions = useSelectModalStore((state) => state.actions);

  const mutation = useDeleteDebrid("torrents", [item.id]);

  const navigate = useNavigate();

  const onAction = useCallback(
    async (key: Key) => {
      if (key === "delete") mutation.mutate();
      else if (key === "copy") {
        toast.promise(
          copyDataToClipboard(item.links.length > 0 ? item.links.join("\n") : ""),
          {
            loading: "",
            success: "Links copied",
            error: "Failed to copy",
          },
          {
            error: {
              duration: 2000,
            },
          },
        );
      } else if (key === "view") {
        modalActions.setCurrentItem(item);
        modalActions.setOpen(true);
      } else if (key === "unrestict") {
        navigate({
          to: "/downloader/$tabId",
          search: { fileId: item.id },
          params: { tabId: "links" },
        });
      }
    },
    [mutation],
  );
  return (
    <Dropdown
      isOpen={open}
      onOpenChange={actions.closeDropdown}
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
        <DropdownItem key="view" startContent={<Icons.Eye />}>
          View Files
        </DropdownItem>
        <DropdownItem key="unrestict" startContent={<Icons.DownloadDashed />}>
          Unrestict Links
        </DropdownItem>
        <DropdownItem key="copy" startContent={<Icons.Copy />}>
          Copy Links
        </DropdownItem>
        <DropdownItem key="delete" startContent={<Icons.Delete />}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

interface TorrentListProps {
  items: DebridTorrent[];
  selectedIds: Selection;
  setSelectedIds: SetValue<Selection>;
  selectMode: boolean;
}
export function TorrentList({ items, selectedIds, setSelectedIds, selectMode }: TorrentListProps) {
  const { open, actions } = useDebridStore(
    useShallow((state) => ({
      open: state.dropdown.open,
      actions: state.actions,
    })),
  );

  const onDropDownOpen = useCallback((e: React.MouseEvent, item: DebridTorrent) => {
    actions.setCurrentDebridItem(item);
    actions.openDropdown();
    actions.setDropdownCords({ x: e.clientX, y: e.clientY });
  }, []);

  const renderEmptyState = () => (
    <p className="text-center text-lg text-zinc-400 absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      No items found
    </p>
  );

  return (
    <>
      {open && <TorrentDropdown />}
      <ListBox
        className={clsx("overflow-auto size-full gap-4 p-2 flex flex-col", scrollClasses)}
        items={items}
        selectionMode={selectMode ? "multiple" : "single"}
        selectionBehavior="toggle"
        renderEmptyState={renderEmptyState}
        dependencies={[selectMode]}
        selectedKeys={selectedIds}
        onSelectionChange={setSelectedIds}
      >
        {(item) => (
          <ListBoxItem
            className={clsx(
              "rounded-3xl data-[selected=true]:bg-white/5 data-[hovered=true]:bg-white/5 p-2",
              dataFocusVisibleClasses,
            )}
            key={item.id}
            textValue={item.filename}
          >
            {({ isSelected }) => (
              <>
                <div className="grid gap-x-4 gap-y-1 md:gap-y-0 cursor-pointer grid-cols-6 rounded-3xl p-2">
                  <div className="col-start-1 col-span-6 sm:col-span-4">
                    <p title={item.filename} className="text-base truncate">
                      {item.filename}
                    </p>
                  </div>

                  <div className="flex ml-auto col-start-4 sm:col-start-5 col-span-full order-2 sm:order-none gap-2">
                    <div className="flex gap-2 items-center">
                      {item.status === "downloading" && <Icons.AnimatedDownload />}

                      {item.status === "uploading" && <Icons.AnimatedUpload />}
                      {item.status === "downloaded" && (
                        <Icons.CheckCircle className="text-success" />
                      )}
                      {item.status === "error" && <Icons.Exclamation className="text-danger" />}
                      {item.status === "waiting_files_selection" && <Icons.SelectWait />}
                      <div className="flex flex-col items-center gap-0.5">
                        <p className="text-bold text-sm truncate capitalize">
                          {item.progress}
                          {"%"}
                        </p>
                        {item.status === "downloading" && (
                          <p className="text-bold text-sm truncate">{size(item.speed!)}/s</p>
                        )}
                      </div>
                    </div>
                    {selectMode ? (
                      <Checkbox
                        isSelected={isSelected}
                        isReadOnly
                        size="lg"
                        classNames={{
                          base: "m-0",
                          wrapper: "before:rounded-full after:rounded-full mr-0",
                        }}
                        icon={<Icons.CheckCircle />}
                      />
                    ) : (
                      <Button
                        disableRipple
                        variant="light"
                        title={"Options"}
                        isIconOnly
                        onClick={(e) => onDropDownOpen(e, item)}
                        className="data-[hover=true]:bg-transparent"
                      >
                        <Icons.Dots />
                      </Button>
                    )}
                  </div>

                  <div className="items-center flex col-start-1 col-span-3 sm:col-span-4">
                    <p className="text-sm text-zinc-400 min-w-20">{size2round(item.bytes)}</p>
                    <p className="text-sm text-zinc-400">{formattedLongDate(item.added)}</p>
                  </div>
                </div>
              </>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </>
  );
}
