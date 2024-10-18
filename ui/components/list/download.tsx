import type React from "react";
import { type Key, useCallback } from "react";
import type { DebridUnlock, SetValue } from "@/types";
import { formattedLongDate, size2round } from "@/ui/utils/common";
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
import { useDebridStore } from "@/ui/utils/store";
import { Icons } from "@/ui/utils/icons";
import { scrollClasses } from "@/ui/utils/classes";
import { ListBox, ListBoxItem } from "react-aria-components";
import clsx from "clsx";
import { useShallow } from "zustand/shallow";
import type { Selection } from "@nextui-org/react";
import { Link } from "@tanstack/react-router";

const DownloadDropdown = () => {
  const { open, cords } = useDebridStore((state) => state.dropdown);
  const { closeDropdown } = useDebridStore((state) => state.actions);

  const item = useDebridStore((state) => state.currentDebridItem) as DebridUnlock;

  const mutation = useDeleteDebrid("downloads", [item.id]);

  const onAction = useCallback(
    async (key: Key) => {
      if (key === "delete") mutation.mutate();
    },
    [mutation],
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
        disabledKeys={[!item.streamable ? "play" : ""]}
      >
        <DropdownItem key="original" startContent={<Icons.ExternalLink />}>
          <a
            rel="noopener noreferrer"
            target="_blank"
            className="no-underline block"
            href={item.link}
          >
            Open Link
          </a>
        </DropdownItem>
        <DropdownItem key="play" startContent={<Icons.Play />}>
          <Link
            to="/watch/$"
            params={{ _splat: item.download.replace("https://", "") }}
            className="block"
          >
            Play
          </Link>
        </DropdownItem>
        <DropdownItem
          download
          href={item.download}
          key="download"
          startContent={<Icons.Download />}
        >
          Download
        </DropdownItem>
        <DropdownItem key="delete" startContent={<Icons.Delete />}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

interface DownloadListProps {
  items: DebridUnlock[];
  selectedIds: Selection;
  setSelectedIds: SetValue<Selection>;
  selectMode: boolean;
}
export function DowloadList({ items, selectedIds, setSelectedIds, selectMode }: DownloadListProps) {
  const { open, actions } = useDebridStore(
    useShallow((state) => ({
      open: state.dropdown.open,
      actions: state.actions,
    })),
  );

  const onDropDownOpen = useCallback((e: React.MouseEvent, item: DebridUnlock) => {
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
      {open && <DownloadDropdown />}
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
                  <div className="col-start-1 col-span-6 sm:col-span-5 flex items-center gap-2">
                    <div
                      title={item.host}
                      className="flex-shrink-0 size-6 p-1 bg-primary rounded-full"
                    >
                      <img alt="hoster" src={item.host_icon} />
                    </div>

                    <p title={item.filename} className="text-base truncate">
                      {item.filename}
                    </p>
                  </div>

                  <div className="flex ml-auto col-start-6 col-end-6 order-2 sm:order-none">
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

                  <div className="items-center flex col-start-1 col-span-5">
                    <p className="text-sm text-zinc-400 min-w-20">{size2round(item.filesize)}</p>
                    <p className="text-sm text-zinc-400">{formattedLongDate(item.generated)}</p>
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
