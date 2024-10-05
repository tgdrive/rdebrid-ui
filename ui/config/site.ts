import HomeOutline from "~icons/ion/home-outline";
import HomeFilled from "~icons/ion/home";
import DownloadCloud from "~icons/lucide/cloud-download";
import TorrentFilled from "~icons/simple-icons/bittorrent";
import TorrentOutline from "~icons/arcticons/bittorrent";

export const siteConfig = {
  name: "Debrid",
  description: "Debrid",
  navItems: [
    {
      id: "home",
      label: "Home",
      path: "/",
      params: { page: 1, limit: 50 },
      icon: HomeOutline,
      activeIcon: HomeFilled,
    },
    {
      id: "torrents",
      label: "Torrents",
      path: "/view",
      params: {
        type: "torrents",
        page: 1,
      },
      icon: TorrentFilled,
      activeIcon: TorrentOutline,
    },
    {
      id: "downloads",
      label: "DLoads",
      path: "/view",
      params: {
        type: "downloads",
        page: 1,
      },
      icon: DownloadCloud,
      activeIcon: DownloadCloud,
    },
  ],
} as const;
