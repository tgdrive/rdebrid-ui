import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DebridTorrent, DebridTorrentFile, FileNode } from "@/types";
import { size2round } from "@/ui/utils/common";
import {
  debridAvailabilityOptions,
  debridItemsQueryOptions,
  debridTorrentQueryOptions,
  useCreateDebrid,
  useDeleteDebrid,
} from "@/ui/utils/queryOptions";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
} from "@nextui-org/react";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { DebridTorrentTree } from "../file-tree";
import { useSelectModalStore } from "@/ui/utils/store";
import { Icons } from "@/ui/utils/icons";
import { paginationItemClass } from "@/ui/utils/classes";
import { getQueryClient } from "@/ui/utils/queryClient";
import type { Selection } from "@nextui-org/react";
import { DowloadList } from "./download";
import { TorrentList } from "./torrent";

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

function pathsToTree(data?: DebridTorrent) {
  const root: FileNode = { name: "root", nodes: [] };

  if (!data?.files) {
    return root;
  }

  data.files.forEach((item: DebridTorrentFile) => {
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
          link: item.link,
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

  const rootNode = useMemo(() => pathsToTree(data), [data?.files]);

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
        onOpenChange={onOpenChange}
        classNames={{
          base: "max-w-[50rem] !bg-radial-1 bg-background",
          closeButton: "hover:bg-white/5 active:bg-white/5",
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
                  <div className="flex items-center justify-between h-10">
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
                            size="sm"
                            className="bg-white/5 rounded-full"
                            onPress={() => {
                              setCurrentAvaliability(
                                (prev) => (prev + 1) % avaliabilityData.avaliabilities.length,
                              );
                            }}
                          >
                            <Icons.ChevronRight />
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
                <div className="relative h-72 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-default/40">
                  {isLoading ? (
                    <Icons.Loading className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2" />
                  ) : (
                    <DebridTorrentTree rootNode={rootNode} status={item.status} />
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
                      .then(() => {
                        getQueryClient().invalidateQueries({
                          queryKey: ["debrid"],
                        });
                        onClose();
                      });
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

export default function DebridList() {
  const params = useSearch({ from: "/_authed/view" });

  const {
    data: { items, totalPages },
  } = useSuspenseQuery(debridItemsQueryOptions(params));

  const navigate = useNavigate();

  const handlePageChange = useCallback(
    (page: number, replace = false) =>
      navigate({ to: "/view", search: { page, type: params.type }, replace, resetScroll: true }),
    [params.type],
  );

  const [selectMode, setSelectMode] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Selection>(new Set());

  const ids = useMemo(() => {
    if (selectedIds === "all") {
      return items.map((item) => item.id);
    }
    return Array.from(selectedIds) as string[];
  }, [selectedIds, items]);

  const postLastPageDelete = useCallback(async () => {
    if (params.page === totalPages && items.length > 0) {
      if (ids.length === items.length) await handlePageChange(params.page - 1, true);
    }
  }, [items, totalPages, params.page, ids]);

  useEffect(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [params.type, params.page]);

  const deleteMutation = useDeleteDebrid(params.type, ids, postLastPageDelete);

  const onBulkDelete = useCallback(() => {
    deleteMutation.mutateAsync().finally(() => setSelectedIds(new Set()));
  }, [deleteMutation]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-wrap gap-3 px-2">
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
          title="Select Mode"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          onPress={() =>
            setSelectMode((prev) => {
              setSelectedIds(new Set());
              return !prev;
            })
          }
        >
          <Icons.SelectMode />
        </Button>
        <Button
          title="Select All"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          isDisabled={!selectMode}
          onPress={() =>
            setSelectedIds((prev) => {
              if (prev === "all") return new Set();
              return "all";
            })
          }
        >
          <Icons.SelectAll />
        </Button>
        <Button
          isLoading={deleteMutation.isPending}
          title="Delete"
          variant="flat"
          className="bg-white/5"
          isIconOnly
          onPress={onBulkDelete}
        >
          <Icons.Delete />
        </Button>
      </div>
    );
  }, [params.page, totalPages, params.type, deleteMutation.isPending, selectMode]);

  const List = params.type === "downloads" ? DowloadList : TorrentList;
  return (
    <div className="size-full grid gap-2 grid-rows-[auto_1fr]">
      {topContent}
      <List
        selectMode={selectMode}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        items={items as any}
      />
    </div>
  );
}
