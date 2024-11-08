import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DebridFileNode, DebridTorrent, DebridTorrentFile } from "@/types";
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
import { useSelectModalStore } from "@/ui/utils/store";
import { Icons } from "@/ui/utils/icons";
import { paginationItemClass } from "@/ui/utils/classes";
import { getQueryClient } from "@/ui/utils/queryClient";
import type { Selection } from "@nextui-org/react";
import { DowloadList } from "./download";
import { TorrentList } from "./torrent";
import { DebridFileTree } from "../file-tree";
import { useShallow } from "zustand/shallow";

function pathsToTree(files: DebridTorrentFile[]) {
  const selectedPaths: string[] = [];
  const selectedFileIds: number[] = [];

  const root: DebridFileNode = {
    name: "root",
    path: "/",
    children: [],
    selected: 0,
    isFolder: true,
  };

  function findOrCreateNode(
    parent: DebridFileNode[],
    name: string,
    fullPath: string,
    isFolder = true
  ) {
    let node = parent.find((n) => n.path === fullPath);
    if (!node) {
      node = {
        name,
        path: fullPath,
        children: [],
        selected: 0,
        isFolder,
      };
      parent.push(node);
    }
    return node;
  }

  files.forEach((file) => {
    const parts = file.path.split("/").filter(Boolean);
    let currentLevel = root.children;
    let currentPath = "";

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += `/${parts[i]}`;
      const node = findOrCreateNode(currentLevel, parts[i], currentPath, true);
      currentLevel = node.children;
    }

    const fileName = parts[parts.length - 1];
    currentPath += `/${fileName}`;
    const fileNode = findOrCreateNode(
      currentLevel,
      fileName,
      currentPath,
      false
    );
    fileNode.fileId = file.id;
    fileNode.selected = file.selected;
    fileNode.link = file.link;

    if (file.selected === 1) {
      selectedPaths.push(fileNode.path);
      selectedFileIds.push(file.id);
    }
  });

  function updateFolderStatus(node: DebridFileNode): {
    totalSelected: number;
    totalFiles: number;
  } {
    if (!node.isFolder) {
      return {
        totalSelected: node.selected,
        totalFiles: 1,
      };
    }

    let totalSelected = 0;
    let totalFiles = 0;

    for (const child of node.children) {
      const childStats = updateFolderStatus(child);
      totalSelected += childStats.totalSelected;
      totalFiles += childStats.totalFiles;
    }

    node.selected = totalFiles > 0 && totalSelected === totalFiles ? 1 : 0;

    if (node.selected === 1) {
      selectedPaths.push(node.path);
    }

    return {
      totalSelected,
      totalFiles,
    };
  }

  updateFolderStatus(root);

  return {
    root,
    paths: selectedPaths,
  };
}

export function FileSelectModal() {
  const [item, actions, selectedPaths, isOpen] = useSelectModalStore(
    useShallow((state) => [
      state.item as DebridTorrent,
      state.actions,
      state.selectedPaths,
      state.open,
    ])
  );

  const [{ data, isLoading }, { data: avaliabilityData }] = useQueries({
    queries: [
      debridTorrentQueryOptions(item.id),
      debridAvailabilityOptions(
        item.hash,
        item.status === "waiting_files_selection" ||
          item.status === "magnet_conversion"
      ),
    ],
  });

  const { root, paths } = useMemo(
    () => pathsToTree(data?.files || []),
    [data?.files]
  );

  useEffect(() => {
    actions.setSelectedPaths(new Set(paths));
  }, [paths]);

  const [currentAvaliability, setCurrentAvaliability] = useState(0);

  useEffect(() => {
    if (data?.files && item.status !== "waiting_files_selection") {
      actions.setSelectedPaths(
        new Set(data.files.filter((x) => x.selected === 1).map((x) => x.path))
      );
    } else if (
      data?.files &&
      (item.status === "waiting_files_selection" ||
        item.status === "magnet_conversion") &&
      avaliabilityData?.avaliabilities &&
      avaliabilityData?.avaliabilities.length > 0
    ) {
      const currentAvaliabilityData =
        avaliabilityData.avaliabilities[currentAvaliability];
      actions.setSelectedPaths(
        new Set(
          data.files
            .filter((x) => currentAvaliabilityData.find((y) => y.id === x.id))
            .map((x) => x.path)
        )
      );
    }
  }, [data?.files, avaliabilityData, item.status, currentAvaliability]);

  const ids = useMemo(() => {
    return (
      data?.files?.filter((x) => selectedPaths.has(x.path)).map((x) => x.id) ||
      []
    );
  }, [data?.files, selectedPaths]);

  const createTorrent = useCreateDebrid();

  return (
    <>
      <Modal
        backdrop="transparent"
        isOpen={isOpen}
        onOpenChange={actions.setOpen}
        classNames={{
          base: "max-w-[50rem] !bg-radial-1 bg-background",
          closeButton: "hover:bg-white/5 active:bg-white/5",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Torrent Files
              </ModalHeader>
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
                                (prev) =>
                                  (prev + 1) %
                                  avaliabilityData.avaliabilities.length
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
                    <DebridFileTree root={root} status={item.status} />
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
                        ids,
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
      navigate({
        to: "/view",
        search: { page, type: params.type },
        replace,
        resetScroll: true,
      }),
    [params.type]
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
    if (
      totalPages > 1 &&
      params.page === totalPages &&
      items.length > 0 &&
      ids.length === items.length
    ) {
      await handlePageChange(params.page - 1, true);
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
        {totalPages > 1 && (
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
        )}

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
  }, [
    params.page,
    totalPages,
    params.type,
    deleteMutation.isPending,
    selectMode,
  ]);

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
