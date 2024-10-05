import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { DebridTorrent, DebridTorrentFile, DebridUnlock, FileNode } from "@/types";
import { copyDataToClipboard, size, size2round } from "@/ui/utils/common";
import {
  debridAvailabilityOptions,
  debridItemsQueryOptions,
  debridTorrentQueryOptions,
  useCreateDebrid,
  useDeleteDebrid,
} from "@/ui/utils/queryOptions";
import {
  Avatar,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
} from "@nextui-org/react";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import EpSuccessFilled from "~icons/ep/success-filled";
import LineMdDownloadingLoop from "~icons/line-md/downloading-loop";
import LineMdUploadingLoop from "~icons/line-md/uploading-loop";
import DeleteIcon from "~icons/material-symbols/delete";
import DownloadIcon from "~icons/material-symbols/download";
import MdiError from "~icons/mdi/error";
import EyeIcon from "~icons/mdi/eye";
import PlayIcon from "~icons/mdi/play-outline";
import PhMagnetStraight from "~icons/ph/magnet-straight";
import UnlockIcon from "~icons/lucide/unlock";
import TadpoleIcon from "~icons/svg-spinners/tadpole";
import { ForwardLink } from "./forward-link";
import { FilesystemTree } from "./file-tree";
import PhSelectionFill from "~icons/ph/selection-fill";
import { useDebridStore, useSelectModalStore } from "@/ui/utils/store";
import ChevronRight from "~icons/mdi/chevron-right";
import { CopyButton } from "./copy-button";
import OpenLinkIcon from "~icons/fluent/open-24-regular";
import SelectAllIcon from "~icons/fluent/select-all-on-16-filled";
import SelectMode from "~icons/ic/round-select-all";
import { getQueryClient } from "../utils/queryClient";

const paginationItemClass = "bg-white/5 [&[data-hover=true]:not([data-active=true])]:bg-white/10";

const getSelectedIds = (rootNode: FileNode, selectedPaths: Set<string>) => {
  const selectedIds: number[] = [];

  const traverseNode = (node: FileNode, path = "") => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    if (selectedPaths.has(fullPath) && node.id !== undefined) {
      selectedIds.push(node.id);
    }
    node.nodes?.forEach((childNode) => traverseNode(childNode, fullPath));
  };

  traverseNode(rootNode);
  return selectedIds;
};

function pathsToTree(items?: DebridTorrentFile[]) {
  const root: FileNode = { name: "root", nodes: [] };

  if (!items) {
    return root;
  }

  items.forEach((item: DebridTorrentFile) => {
    const parts: string[] = item.path.replace(/^\//, "").split("/");
    let currentNode: FileNode = root;

    parts.forEach((part: string, index: number) => {
      if (!part) {
        return;
      }

      let childNode: FileNode | undefined = currentNode.nodes?.find(
        (node: FileNode) => node.name === part,
      );

      if (!childNode) {
        childNode = {
          name: part,
          id: index === parts.length - 1 ? item.id : undefined,
        };
        if (!currentNode.nodes) {
          currentNode.nodes = [];
        }
        currentNode.nodes.push(childNode);
      }

      if (index < parts.length - 1 && !childNode.nodes) {
        childNode.nodes = [];
      }

      currentNode = childNode;
    });
  });

  return root;
}

export function FileSelectModal() {
  const item = useSelectModalStore((state) => state.item) as DebridTorrent;
  const onOpenChange = useSelectModalStore((state) => state.actions.setOpen);
  const isOpen = useSelectModalStore((state) => state.open);
  const actions = useSelectModalStore((state) => state.actions);

  const selectedPaths = useSelectModalStore((state) => state.selectedPaths);

  const [{ data, isLoading }, { data: avaliabilityData }] = useQueries({
    queries: [
      debridTorrentQueryOptions(item.id),
      debridAvailabilityOptions(item.hash, item.status === "waiting_files_selection"),
    ],
  });

  const rootNode = useMemo(() => pathsToTree(data?.files), [data?.files]);

  const [currentAvaliability, setCurrentAvaliability] = useState(0);

  useEffect(() => {
    if (data?.files && item.status !== "waiting_files_selection") {
      actions.setSelectedPaths(
        new Set(data.files.filter((x) => x.selected === 1).map((x) => `root${x.path}`) || []),
      );
    } else if (
      data?.files &&
      item.status === "waiting_files_selection" &&
      avaliabilityData?.avaliabilities &&
      avaliabilityData?.avaliabilities.length > 0
    ) {
      const currentAvaliabilityData = avaliabilityData.avaliabilities[currentAvaliability];
      actions.setSelectedPaths(
        new Set(
          data.files
            .filter((x) => currentAvaliabilityData.find((y) => y.id === x.id))
            .map((x) => `root${x.path}`) || [],
        ),
      );
    }
  }, [data?.files, avaliabilityData, item.status, currentAvaliability]);

  const createTorrent = useCreateDebrid();

  return (
    <>
      <Modal
        backdrop="transparent"
        isOpen={isOpen}
        disableAnimation
        onOpenChange={onOpenChange}
        classNames={{
          base: "max-w-[50rem] backdrop-blur-lg bg-background/50",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Torrent Files</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  <div className="flex text-sm">
                    <h2>Name:&nbsp;</h2>
                    <h2 title={item.filename} className="truncate font-bold">
                      {item.filename}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex text-sm">
                      <h2>Size :&nbsp;</h2>
                      <h2 className="font-bold">{size2round(item.bytes)}</h2>
                    </span>
                    {avaliabilityData?.avaliabilities &&
                      avaliabilityData.avaliabilities.length > 0 && (
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            Avaliability: {currentAvaliability + 1} of{" "}
                            {avaliabilityData.avaliabilities.length}
                          </p>
                          <Button
                            isIconOnly
                            className="bg-white/5 rounded-full"
                            onPress={() => {
                              setCurrentAvaliability(
                                (prev) => (prev + 1) % avaliabilityData.avaliabilities.length,
                              );
                            }}
                          >
                            <ChevronRight />
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
                <div className="relative h-72 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-default/40">
                  {isLoading ? (
                    <TadpoleIcon className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2" />
                  ) : (
                    <FilesystemTree rootNode={rootNode} status={item.status} />
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="bg-white/5 rounded-full"
                  isLoading={createTorrent.isPending}
                  onPress={() => {
                    createTorrent
                      .mutateAsync({
                        fileId: item.id,
                        ids: getSelectedIds(rootNode, selectedPaths),
                      })
                      .then(onClose);
                  }}
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

interface TorrentListItemProps {
  item: DebridTorrent;
}

const TorrentListItem = memo(({ item }: TorrentListItemProps) => {
  const modalActions = useSelectModalStore((state) => state.actions);
  const onModalOpen = useCallback(() => {
    modalActions.setCurrentItem(item);
    modalActions.setOpen(true);
  }, []);

  const selected = useDebridStore((state) => state.selectedIds[item.id] || false);

  const selectMode = useDebridStore((state) => state.selectMode);

  const actions = useDebridStore((state) => state.actions);

  const mutation = useDeleteDebrid("torrents", [item.id]);

  const onSelectionChange = useCallback(
    (isSelected: boolean) => {
      if (isSelected) {
        actions.addSelectedId(item.id);
      } else {
        actions.removeSelectedId(item.id);
      }
    },
    [item.id],
  );

  return (
    <div className="hover:bg-white/5 transition grid gap-x-4 gap-y-2 cursor-pointer grid-cols-6 rounded-3xl py-2 px-3">
      <div className="flex gap-3 w-full col-span-6 sm:col-span-5 lg:col-span-4 items-center">
        {selectMode && (
          <Checkbox
            isSelected={selected}
            onValueChange={onSelectionChange}
            size="lg"
            classNames={{
              base: "m-0",
              wrapper: "before:rounded-full after:rounded-full mr-0",
            }}
            icon={<EpSuccessFilled />}
          />
        )}
        <p title={item.filename} className="text-bold text-md truncate capitalize">
          {item.filename}
        </p>
      </div>

      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
        {item.status === "downloading" && <LineMdDownloadingLoop className="size-6" />}

        {item.status === "uploading" && <LineMdUploadingLoop className="size-6" />}
        {item.status === "downloaded" && <EpSuccessFilled className="size-6 text-success" />}
        {item.status === "error" && <MdiError className="size-6 text-danger" />}
        {item.status === "waiting_files_selection" && (
          <PhSelectionFill className="size-6 text-yellow-500" />
        )}
        <p className="text-bold text-sm truncate capitalize">
          {item.progress}
          {"%"}
        </p>
        {item.status === "downloading" && (
          <p className="text-bold text-sm truncate">{size(item.speed!)}/s</p>
        )}
      </div>
      <div className="flex items-center col-span-3 lg:col-span-1">
        <Button
          variant="light"
          isIconOnly
          title="View Files"
          onPress={onModalOpen}
          className="data-[hover=true]:bg-transparent"
        >
          <EyeIcon />
        </Button>

        <Button
          as={ForwardLink}
          variant="light"
          isIconOnly
          to="/downloader/$tabId"
          search={{ fileId: item.id }}
          params={{ tabId: "links" }}
          title="Unrestict Links"
          className="data-[hover=true]:bg-transparent"
          onMouseEnter={() => {
            getQueryClient().setQueryData(["debrid", "torrents", item.id], item);
          }}
        >
          <UnlockIcon />
        </Button>

        <CopyButton title="Copy Links" value={item.links.length > 0 ? item.links.join("\n") : ""} />

        <Button
          variant="light"
          isIconOnly
          title="Delete"
          color="danger"
          onPress={() => mutation.mutate()}
          className="data-[hover=true]:bg-transparent"
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
});

interface DownloadListItemProps {
  item: DebridUnlock;
}

export const DownloadListItem = memo(({ item }: DownloadListItemProps) => {
  const selected = useDebridStore((state) => state.selectedIds[item.id] || false);

  const selectMode = useDebridStore((state) => state.selectMode);

  const actions = useDebridStore((state) => state.actions);

  const mutation = useDeleteDebrid("downloads", [item.id]);

  const onSelectionChange = useCallback(
    (isSelected: boolean) => {
      if (isSelected) {
        actions.addSelectedId(item.id);
      } else {
        actions.removeSelectedId(item.id);
      }
    },
    [item.id],
  );

  return (
    <div className="hover:bg-white/5 transition grid gap-x-4 gap-y-2 cursor-pointer grid-cols-6 rounded-3xl py-2 px-3">
      <div className="flex gap-3 w-full col-span-6 sm:col-span-4 items-center">
        {selectMode ? (
          <Checkbox
            isSelected={selected}
            onValueChange={onSelectionChange}
            size="lg"
            classNames={{
              base: "m-0",
              wrapper: "before:rounded-full after:rounded-full mr-0",
            }}
            icon={<EpSuccessFilled />}
          />
        ) : (
          <div className="size-10 p-2">
            <Avatar title={item.host} className="flex-shrink-0 w-6 h-6 p-1" src={item.host_icon} />
          </div>
        )}
        <p title={item.filename} className="text-bold text-md truncate capitalize ">
          {item.filename}
        </p>
      </div>

      <div className="flex items-center sm:ml-auto col-span-3 sm:col-span-2">
        <Button
          variant="light"
          as={"a"}
          title={"Original Link"}
          isIconOnly
          target="_blank"
          rel="noopener noreferrer"
          href={item.link}
          className="data-[hover=true]:bg-transparent"
        >
          <OpenLinkIcon />
        </Button>

        <Button
          variant="light"
          title={"Play Video"}
          as={ForwardLink}
          isIconOnly
          to="/watch/$"
          params={{
            _splat: item.download.replace("https://", ""),
          }}
          className="data-[hover=true]:bg-transparent"
        >
          <PlayIcon />
        </Button>

        <Button
          variant="light"
          as={"a"}
          title={"Download Video"}
          isIconOnly
          rel="noopener noreferrer"
          href={item.download}
          className="data-[hover=true]:bg-transparent"
        >
          <DownloadIcon />
        </Button>

        <Button
          variant="light"
          title={"Delete Link"}
          isIconOnly
          color="danger"
          onClick={() => mutation.mutate()}
          className="data-[hover=true]:bg-transparent"
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
});

export default function DebridList() {
  const params = useSearch({ from: "/_authenticated/view" });

  const {
    data: { items, totalPages },
  } = useSuspenseQuery(debridItemsQueryOptions(params));

  const navigate = useNavigate();

  const handlePageChange = useCallback(
    (page: number, replace = false) =>
      navigate({ to: "/view", search: { page, type: params.type }, replace, resetScroll: true }),
    [params.type],
  );

  const actions = useDebridStore((state) => state.actions);

  const selectedIds = useDebridStore((state) => state.selectedIds);

  const selectMode = useDebridStore((state) => state.selectMode);

  const selectKeys = Object.keys(selectedIds);

  const postLastPageDelete = useCallback(async () => {
    let itemsSelectedOnPage = 0;
    if (params.page === totalPages && items.length > 0) {
      for (const item of items) {
        if (selectedIds[item.id]) {
          itemsSelectedOnPage++;
        }
      }
      if (itemsSelectedOnPage === items.length) {
        await handlePageChange(params.page - 1, true);
      }
    }
  }, [items, totalPages, params.page, selectedIds]);

  const deleteMutation = useDeleteDebrid(params.type, selectKeys, postLastPageDelete);

  const selectAll = useCallback(() => {
    actions.addSelectedIds(items.map((item) => item.id));
  }, [items]);

  const onBulkDelete = useCallback(() => {
    deleteMutation.mutateAsync().finally(() => actions.clearSelectedIds());
  }, [deleteMutation]);

  useEffect(() => {
    actions.setSelectMode(false);
    actions.clearSelectedIds();
  }, [params.type]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={params.page}
          total={totalPages}
          onChange={handlePageChange}
          classNames={{
            item: paginationItemClass,
            prev: paginationItemClass,
            next: paginationItemClass,
          }}
        />

        <Button
          title="Toggle Select Mode"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          onPress={() => actions.toggleSelectMode()}
        >
          <SelectMode />
        </Button>
        <Button
          title="Select All"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          isDisabled={!selectMode}
          onPress={selectAll}
        >
          <SelectAllIcon />
        </Button>
        <Button
          isLoading={deleteMutation.isPending}
          title="Delete Selected"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          onPress={onBulkDelete}
        >
          <DeleteIcon />
        </Button>
      </div>
    );
  }, [params.page, totalPages, params.type, deleteMutation.isPending, selectMode]);

  return (
    <div className="size-full">
      {topContent}
      <div className="flex flex-col gap-4 px-2 py-3">
        {params.type === "torrents"
          ? items.map((item) => <TorrentListItem key={item.id} item={item as DebridTorrent} />)
          : items.map((item) => <DownloadListItem key={item.id} item={item as DebridUnlock} />)}
      </div>
    </div>
  );
}
