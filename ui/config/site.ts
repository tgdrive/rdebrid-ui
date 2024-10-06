import HomeOutline from "~icons/ion/home-outline";
import HomeFilled from "~icons/ion/home";
import DownloadOutline from "~icons/mingcute/download-3-line";
import DownloadFilled from "~icons/mingcute/download-3-fill";
import TorrentFilled from "~icons/simple-icons/bittorrent";
import TorrentOutline from "~icons/arcticons/bittorrent";

export const siteConfig = {
  name: "Debrid",
  description: "Debrid",
  navItems: [
    {
      id: "home",
      label: "Home",
      path: "/downloader/links",
      search: {},
      icon: HomeOutline,
      activeIcon: HomeFilled,
    },
    {
      id: "torrents",
      label: "Torrents",
      path: "/view",
      search: {
        type: "torrents",
        page: 1,
      },
      icon: TorrentOutline,
      activeIcon: TorrentFilled,
    },
    {
      id: "downloads",
      label: "DLoads",
      path: "/view",
      search: {
        type: "downloads",
        page: 1,
      },
      icon: DownloadOutline,
      activeIcon: DownloadFilled,
    },
  ],
} as const;
