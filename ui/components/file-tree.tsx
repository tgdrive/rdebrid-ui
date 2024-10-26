import type React from "react";
import { useState, memo, useCallback } from "react";

import { motion } from "framer-motion";
import { Button, Checkbox } from "@nextui-org/react";
import type { DebridFileNode, DebridTorrent } from "@/types";
import { Icons } from "@/ui/utils/icons";
import { useQuery } from "@tanstack/react-query";
import { debridUnrestrictLinkOptions } from "@/ui/utils/queryOptions";
import { useSelectModalStore } from "../utils/store";

const UnRestrictButton = memo(({ link }: { link: string }) => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading } = useQuery(
    debridUnrestrictLinkOptions(link, enabled)
  );

  return (
    <>
      {data?.link ? (
        <Button
          title="Download"
          as={"a"}
          rel="noopener noreferrer"
          href={data.download}
          variant="light"
          isIconOnly
          className="data-[hover=true]:bg-transparent w-6 h-6 min-w-6"
        >
          <Icons.DownloadDashed />
        </Button>
      ) : (
        <Button
          title="Unrestrict"
          variant="light"
          onPress={() => setEnabled(true)}
          isLoading={isLoading}
          isIconOnly
          className="data-[hover=true]:bg-transparent w-6 h-6 min-w-6"
        >
          <Icons.DownloadDashed />
        </Button>
      )}
    </>
  );
});

interface DebridTreeItemProps {
  node: DebridFileNode;
  status: DebridTorrent["status"];
}

const getAllChildKeys = (node: DebridFileNode) => {
  let keys = new Set([node.path]);
  if (node.children) {
    node.children.forEach((child) => {
      let childKeys = getAllChildKeys(child);
      for (let key of childKeys) {
        keys.add(key);
      }
    });
  }
  return keys;
};

export function DebridTreeItem({ status, node }: DebridTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  const selectedPaths = useSelectModalStore((state) => state.selectedPaths);

  const actions = useSelectModalStore((state) => state.actions);

  const handleSelectionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSelectedKeys = new Set(selectedPaths);
      if (e.target.checked) {
        const childKeys = getAllChildKeys(node);
        childKeys.forEach((key) => newSelectedKeys.add(key));
      } else {
        const childKeys = getAllChildKeys(node);
        childKeys.forEach((key) => newSelectedKeys.delete(key));
      }
      actions.setSelectedPaths(newSelectedKeys);
    },
    [selectedPaths]
  );

  const isSelected = selectedPaths.has(node.path);

  return (
    <li key={node.path}>
      <span className="flex items-center gap-1.5 py-1">
        <Checkbox
          className="m-0 p-0"
          isSelected={isSelected}
          disableAnimation
          size="sm"
          isDisabled={
            status !== "waiting_files_selection" &&
            status !== "magnet_conversion"
          }
          onChange={handleSelectionChange}
        />
        {node.children && node.children.length > 0 && (
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
        {node.isFolder && <Icons.Folder className="text-primary-500" />}
        {!node.isFolder && isSelected && status === "downloaded" && (
          <UnRestrictButton link={node.link!} />
        )}
        <p title={node.name} className="text-sm truncate">
          {node.name}
        </p>
      </span>

      {isOpen && node.children.length > 0 && (
        <ul className="pl-6 overflow-hidden flex flex-col justify-end">
          {node.children.map((childNode) => (
            <DebridTreeItem
              key={childNode.path}
              node={childNode}
              status={status}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface DebridFileTreeProps {
  root: DebridFileNode;
  status: DebridTorrent["status"];
}

export function DebridFileTree({ root, status }: DebridFileTreeProps) {
  return (
    <ul>
      <DebridTreeItem status={status} node={root} />
    </ul>
  );
}
