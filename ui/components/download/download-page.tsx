import type { DebridUnlock, DownloadTab } from "@/types";
import { Avatar, Button, Tab, Tabs, Tooltip } from "@nextui-org/react";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import clsx from "clsx";
import { useDebridStore } from "@/ui/utils/store";
import { Icons } from "@/ui/utils/icons";
import { memo, useMemo } from "react";
import { ForwardLink } from "@/ui/components/forward-link";
import { scrollClasses } from "@/ui/utils/classes";
import { CopyButton } from "@/ui/components/copy-button";

const titleMap = {
  links: "Unrestrict Links",
  torrents: "Add Torrents",
};

const getIcon = (tab: DownloadTab) => {
  switch (tab) {
    case "links":
      return <Icons.Link />;
    case "torrents":
      return <Icons.BitTorrent />;
  }
};

const routeApi = getRouteApi("/_authed/downloader/$tabId");

interface DownloadListItemProps {
  item: DebridUnlock;
}

export const UnlockListItem = memo(({ item }: DownloadListItemProps) => {
  return (
    <div className="hover:bg-white/5 transition grid gap-x-4 gap-y-2 cursor-pointer grid-cols-6 rounded-3xl py-2 px-3">
      <div className="flex gap-3 w-full col-span-6 sm:col-span-4 items-center">
        <div className="size-10 p-2">
          <Avatar title={item.host} className="flex-shrink-0 w-6 h-6 p-1" src={item.host_icon} />
        </div>

        <p
          title={item.error ? "" : item.filename}
          className={clsx("text-bold text-md truncate", !item.error && "capitalize")}
        >
          {item.error ? item.link : item.filename}
        </p>
      </div>

      <div className="flex items-center sm:ml-auto col-span-3 sm:col-span-2">
        <div className="size-10 flex items-center justify-center">
          {item.error ? (
            <Tooltip
              offset={-6}
              content={item.error.replaceAll("_", " ")}
              color="danger"
              className="capitalize"
              closeDelay={200}
            >
              <Button
                disableAnimation
                isIconOnly
                className="capitalize bg-transparent data-[hover=true]:bg-transparent"
              >
                <Icons.Exclamation className="text-danger" />
              </Button>
            </Tooltip>
          ) : (
            <Icons.Check className="text-success" />
          )}
        </div>
        <Button
          variant="light"
          title={"Play"}
          as={ForwardLink}
          isIconOnly
          isDisabled={!!item.error || item.streamable === 0}
          to="/watch/$"
          params={{
            _splat: item.download?.replace("https://", ""),
          }}
          className="data-[hover=true]:bg-transparent"
        >
          <Icons.Play />
        </Button>

        <Button
          variant="light"
          as={"a"}
          title={"Download"}
          isIconOnly
          isDisabled={!!item.error || item.streamable === 0}
          rel="noopener noreferrer"
          href={item.download}
          className="data-[hover=true]:bg-transparent"
        >
          <Icons.DownloadDashed />
        </Button>
      </div>
    </div>
  );
});

export const DownloadPage = () => {
  const tabId = routeApi.useParams().tabId as DownloadTab;

  const navigate = routeApi.useNavigate();

  const files = useDebridStore((state) => state.unRestrictedFiles);

  const copyContent = useMemo(
    () =>
      files
        .filter((item) => item.download)
        .map((item) => item.download)
        .join("\n"),
    [files],
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="w-full flex flex-col gap-3 max-w-2xl mx-auto p-3 rounded-lg ring-2 ring-white/10 bg-radial-1 bg-background">
        <p className="text-xl capitalize">{titleMap[tabId]}</p>
        <div className="space-y-4">
          <Tabs
            aria-label="tabs"
            color="primary"
            variant="bordered"
            radius="full"
            selectedKey={tabId}
            onSelectionChange={(key) => navigate({ params: { tabId: key as DownloadTab } })}
          >
            {Object.keys(titleMap).map((tab) => (
              <Tab
                key={tab}
                title={
                  <div className="flex items-center space-x-2 capitalize">
                    {getIcon(tab as DownloadTab)}
                    <span>{tab as DownloadTab}</span>
                  </div>
                }
              >
                <Outlet />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
      {files.length > 0 && (
        <div
          className={clsx(
            "w-full flex flex-col gap-3 max-w-2xl mx-auto p-3",
            "rounded-lg ring-2 ring-white/10 bg-radial-1 bg-background",
            "max-h-96 gap-4",
          )}
        >
          <div className="flex justify-between pt-2">
            <p className="text-lg capitalize">Links</p>
            <CopyButton value={copyContent} title="Copy Links" />
          </div>

          <div
            data-scroll-restoration-id="scroll"
            className={clsx("flex flex-col gap-4 px-2 py-3 overflow-y-auto", scrollClasses)}
          >
            {files.map((item) => (
              <UnlockListItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
