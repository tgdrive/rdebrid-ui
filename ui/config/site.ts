import { Icons } from "@/ui/utils/icons";

export const siteConfig = {
  name: "Debrid",
  description: "Debrid",
  navItems: [
    {
      id: "home",
      label: "Home",
      path: "/downloader/links",
      search: {},
      icon: Icons.HomeOutline,
      activeIcon: Icons.HomeFilled,
    },
    {
      id: "torrents",
      label: "Torrents",
      path: "/view",
      search: {
        type: "torrents",
        page: 1,
      },
      icon: Icons.TorrentOutline,
      activeIcon: Icons.TorrentFilled,
    },
    {
      id: "downloads",
      label: "Dloads",
      path: "/view",
      search: {
        type: "downloads",
        page: 1,
      },
      icon: Icons.Download,
      activeIcon: Icons.DownloadFilled,
    },
  ],
} as const;
