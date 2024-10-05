import type React from "react";
import { useState, useCallback, useMemo, act, useEffect } from "react";
import ChevronRightIcon from "~icons/heroicons/chevron-right-solid";
import FolderIcon from "~icons/heroicons/folder-solid";

import { motion } from "framer-motion";
import { Button, Checkbox } from "@nextui-org/react";
import type { DebridTorrent, FileNode } from "@/types";
import { useSelectModalStore } from "../utils/store";

interface FilesystemItemProps {
  node: FileNode;
  path: string;
  status: DebridTorrent["status"];
  selectedPaths: Set<string>;
  onSelectionChange: (path: string, isSelected: boolean) => void;
}

export function FilesystemItem({
  node,
  path,
  status,
  selectedPaths,
  onSelectionChange,
}: FilesystemItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isSelected = selectedPaths.has(fullPath);

  const handleSelectionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSelectionChange(fullPath, e.target.checked);
    },
    [fullPath, onSelectionChange],
  );

  return (
    <li key={node.name}>
      <span className="flex items-center gap-1.5 py-1 text-sm">
        <Checkbox
          className="m-0 p-0"
          isSelected={isSelected}
          disableAnimation
          size="sm"
          isDisabled={status !== "waiting_files_selection"}
          onChange={handleSelectionChange}
        />
        {node.nodes && node.nodes.length > 0 && (
          <Button
            isIconOnly
            onPress={() => setIsOpen(!isOpen)}
            className="p-1 bg-transparent w-6 h-6 min-w-6"
            disableAnimation
          >
            <motion.span
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="flex"
            >
              <ChevronRightIcon className="size-4 text-gray-500" />
            </motion.span>
          </Button>
        )}
        {node.nodes && <FolderIcon className="size-6 text-yellow-300" />}
        {node.name}
      </span>

      {isOpen && node.nodes && (
        <ul className="pl-6 overflow-hidden flex flex-col justify-end">
          {node.nodes.map((childNode) => (
            <FilesystemItem
              node={childNode}
              key={childNode.name}
              path={fullPath}
              status={status}
              selectedPaths={selectedPaths}
              onSelectionChange={onSelectionChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FilesystemTree({
  rootNode,
  status,
}: { rootNode: FileNode; status: DebridTorrent["status"] }) {
  const actions = useSelectModalStore((state) => state.actions);

  const selectedPaths = useSelectModalStore((state) => state.selectedPaths);

  const updateSelectionRecursively = useCallback(
    (node: FileNode, path: string, isSelected: boolean, newSelection: Set<string>) => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      if (isSelected) {
        newSelection.add(fullPath);
      } else {
        newSelection.delete(fullPath);
      }

      if (node.nodes) {
        node.nodes.forEach((childNode) => {
          updateSelectionRecursively(childNode, fullPath, isSelected, newSelection);
        });
      }
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (path: string, isSelected: boolean) => {
      const newSelection = new Set(selectedPaths);

      const findAndUpdateNode = (node: FileNode, currentPath = "") => {
        const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (nodePath === path) {
          updateSelectionRecursively(node, currentPath, isSelected, newSelection);
          return true;
        }
        if (node.nodes) {
          for (const childNode of node.nodes) {
            if (findAndUpdateNode(childNode, nodePath)) {
              return true;
            }
          }
        }
        return false;
      };

      findAndUpdateNode(rootNode);
      actions.setSelectedPaths(newSelection);
    },
    [rootNode, selectedPaths, updateSelectionRecursively],
  );

  return (
    <ul>
      <FilesystemItem
        node={rootNode}
        key={rootNode.name}
        path=""
        status={status}
        selectedPaths={selectedPaths}
        onSelectionChange={handleSelectionChange}
      />
    </ul>
  );
}
