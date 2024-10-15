import type { BtSearchResponse, DebridTorrent, DebridUnlock } from "@/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SelectModalState = {
  open: boolean;
  item?: DebridTorrent;
  selectedPaths: Set<string>;
  actions: {
    setOpen: (open: boolean) => void;
    setCurrentItem: (currentFile: DebridTorrent) => void;
    setSelectedPaths: (selectedPaths: Set<string>) => void;
  };
};

export const useSelectModalStore = create<SelectModalState>((set) => ({
  open: false,
  selectedPaths: new Set(),
  actions: {
    setOpen: (open: boolean) => set((state) => ({ ...state, open })),
    setCurrentItem: (item: DebridTorrent) => set((state) => ({ ...state, item })),
    setSelectedPaths: (selectedPaths: Set<string>) => set((state) => ({ ...state, selectedPaths })),
  },
}));

type DebridStore = {
  unRestrictedFiles: DebridUnlock[];
  unRestrictState: "running" | "idle";
  selectMode: boolean;
  selectedIds: Record<string, boolean>;
  dropdown: { open: boolean; cords: { x: number; y: number } };
  currentBtTorrent: BtSearchResponse["torrents"][0] | null;
  actions: {
    addSelectedId: (id: string) => void;
    removeSelectedId: (id: string) => void;
    clearSelectedIds: () => void;
    setSelectMode: (selectMode: boolean) => void;
    toggleSelectMode: () => void;
    addSelectedIds: (ids: string[]) => void;
    addUnrestrictedFile: (file: DebridUnlock) => void;
    setUnRestrictState: (unRestrictState: "running" | "idle") => void;
    clearUnrestrictedFiles: () => void;
    openDropdown: () => void;
    closeDropdown: () => void;
    setDropdownCords: (cords: { x: number; y: number }) => void;
    setCurrentBtTorrent: (torrent: BtSearchResponse["torrents"][0]) => void;
  };
};

export const useDebridStore = create<DebridStore>()(
  immer((set) => ({
    unRestrictedFiles: [],
    unRestrictState: "idle",
    selectedIds: {},
    selectMode: false,
    dropdown: {
      open: false,
      cords: { x: 0, y: 0 },
    },
    currentBtTorrent: null,
    actions: {
      addSelectedId: (id: string) =>
        set((state) => {
          state.selectedIds[id] = true;
        }),
      removeSelectedId: (id: string) =>
        set((state) => {
          delete state.selectedIds[id];
        }),
      clearSelectedIds: () =>
        set((state) => {
          state.selectedIds = {};
        }),
      setSelectMode: (selectMode: boolean) =>
        set((state) => {
          state.selectMode = selectMode;
        }),
      toggleSelectMode: () =>
        set((state) => {
          state.selectMode = !state.selectMode;
          if (!state.selectMode) {
            state.selectedIds = {};
          }
        }),
      addSelectedIds: (ids: string[]) =>
        set((state) => {
          ids.forEach((id) => {
            state.selectedIds[id] = true;
          });
        }),

      addUnrestrictedFile: (file: DebridUnlock) =>
        set((state) => {
          state.unRestrictedFiles.push(file);
        }),

      setUnRestrictState: (unRestrictState: "running" | "idle") =>
        set((state) => {
          state.unRestrictState = unRestrictState;
        }),
      clearUnrestrictedFiles: () =>
        set((state) => {
          state.unRestrictedFiles = [];
        }),
      openDropdown: () =>
        set((state) => {
          state.dropdown.open = true;
        }),
      closeDropdown: () =>
        set((state) => {
          state.dropdown.open = false;
          state.dropdown.cords = { x: 0, y: 0 };
        }),
      setDropdownCords: (payload) =>
        set((state) => {
          state.dropdown.cords = payload;
        }),
      setCurrentBtTorrent: (torrent) =>
        set((state) => {
          state.currentBtTorrent = torrent;
        }),
    },
  })),
);
