import type { DebridItem, DebridTorrent, DebridUnlock } from "@/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { combine } from "zustand/middleware";

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

export const useDebridStore = create(
  immer(
    combine(
      {
        unRestrictedFiles: [] as DebridUnlock[],
        unRestrictState: "idle" as "running" | "idle",
        dropdown: {
          open: false,
          cords: { x: 0, y: 0 },
        },
        currentDebridItem: null as DebridItem,
      },
      (set) => ({
        actions: {
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
          setDropdownCords: (payload: {
            x: number;
            y: number;
          }) =>
            set((state) => {
              state.dropdown.cords = payload;
            }),
          setCurrentDebridItem: (item: DebridItem) =>
            set((state) => {
              state.currentDebridItem = item;
            }),
        },
      }),
    ),
  ),
);
