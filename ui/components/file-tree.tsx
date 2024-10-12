import type React from "react";
import { useState, useCallback } from "react";

import { motion } from "framer-motion";
import { Button, Checkbox } from "@nextui-org/react";
import type { DebridTorrent, FileNode } from "@/types";
import { useSelectModalStore } from "@/ui/utils/store";
import { ForwardLink } from "./forward-link";
import { Icons } from "@/ui/utils/icons";

interface DebridTorrentItemProps {
  node: FileNode;
  path: string;
  status: DebridTorrent["status"];
  selectedPaths: Set<string>;
  onSelectionChange: (path: string, isSelected: boolean) => void;
}

export function DebridTorrentItem({
  node,
  path,
  status,
  selectedPaths,
  onSelectionChange,
}: DebridTorrentItemProps) {
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
              <Icons.ChevronRight className="size-4 text-gray-500" />
            </motion.span>
          </Button>
        )}
        {node.nodes && <Icons.Folder className="text-primary-500" />}
        {(!node.nodes || node.nodes.length === 0) && isSelected && (
          <Button
            title="Unrestrict Link"
            as={ForwardLink}
            to="/downloader/$tabId"
            target="_blank"
            rel="noopener noreferrer"
            params={{ tabId: "links" }}
            search={{ restrictedId: node.link?.split("/").pop() }}
            variant="light"
            isIconOnly
            className="data-[hover=true]:bg-transparent w-6 h-6 min-w-6"
          >
            <Icons.DownloadDashed />
          </Button>
        )}
        {node.name}
      </span>

      {isOpen && node.nodes && (
        <ul className="pl-6 overflow-hidden flex flex-col justify-end">
          {node.nodes.map((childNode) => (
            <DebridTorrentItem
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

export function DebridTorrentTree({
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
      <DebridTorrentItem
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
