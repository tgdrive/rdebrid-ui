import type { DebridTorrent, DebridUnlock } from "@/types";
import { create } from "zustand";

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
  };
};

export const useDebridStore = create<DebridStore>((set) => ({
  unRestrictedFiles: [],
  unRestrictState: "idle",
  selectedIds: {},
  selectMode: false,
  actions: {
    addSelectedId: (id: string) =>
      set((state) => ({
        selectedIds: { ...state.selectedIds, [id]: true },
      })),
    removeSelectedId: (id: string) =>
      set((state) => {
        const { [id]: _, ...rest } = state.selectedIds;
        return { selectedIds: rest };
      }),
    clearSelectedIds: () => set({ selectedIds: {} }),
    setSelectMode: (selectMode: boolean) => set({ selectMode }),
    toggleSelectMode: () => set((state) => ({ selectMode: !state.selectMode, selectedIds: {} })),
    addSelectedIds: (ids: string[]) =>
      set((state) => ({
        selectedIds: { ...state.selectedIds, ...Object.fromEntries(ids.map((id) => [id, true])) },
      })),
    addUnrestrictedFile: (file: DebridUnlock) =>
      set((state) => ({ unRestrictedFiles: [...state.unRestrictedFiles, file] })),
    setUnRestrictState: (unRestrictState: "running" | "idle") => set({ unRestrictState }),
    clearUnrestrictedFiles: () => set({ unRestrictedFiles: [] }),
  },
}));
