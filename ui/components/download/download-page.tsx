import type { DownloadTab } from "@/types";
import { Tab, Tabs } from "@nextui-org/react";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import DownloadIcon from "~icons/mingcute/file-download-fill";
import clsx from "clsx";
import { useDebridStore } from "@/ui/utils/store";
import { DownloadListItem } from "@/ui/components/debrid-list";
import { Icons } from "@/ui/utils/icons";

const titleMap = {
  links: "Unrestrict Links",
  torrents: "Add Torrents",
};

const getIcon = (tab: DownloadTab) => {
  switch (tab) {
    case "links":
      return <DownloadIcon />;
    case "torrents":
      return <Icons.BitTorrent />;
  }
};

const routeApi = getRouteApi("/_authenticated/downloader/$tabId");

export const DownloadPage = () => {
  const tabId = routeApi.useParams().tabId as DownloadTab;

  const navigate = routeApi.useNavigate();

  const files = useDebridStore((state) => state.unRestrictedFiles);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="w-full flex flex-col gap-3 max-w-2xl mx-auto p-3 rounded-lg ring-2 ring-white/10 bg-dialog">
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
            "rounded-lg border-2 border-white/20 bg-background/50",
            "max-h-96",
          )}
        >
          <p className="text-xl capitalize">Unrestricted Links</p>
          <div className="flex flex-col gap-4 px-2 py-3">
            {files.map((item) => (
              <DownloadListItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
