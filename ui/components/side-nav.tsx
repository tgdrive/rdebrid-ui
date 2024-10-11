import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/ui/config/site";
import clsx from "clsx";

export const SideNav = () => {
  return (
    <aside
      className={clsx(
        "absolute bottom-0 left-0 md:top-20 z-50 flex gap-4 md:w-20 md:h-full md:flex-col items-center",
        "w-full h-16 top-auto justify-around md:justify-start",
      )}
    >
      {siteConfig.navItems.map((item, _) => (
        <Link
          className="flex items-center justify-center flex-col gap-1 size-14 hover:bg-white/5 rounded-lg group"
          key={item.id}
          to={item.path}
          search={item.search as any}
          preload="intent"
        >
          {({ isActive }) => {
            return (
              <>
                {isActive ? <item.activeIcon /> : <item.icon />}
                <p className="text-sm md:group-hover:opacity-100 md:opacity-0 opacity-100 select-none">
                  {item.label}
                </p>
              </>
            );
          }}
        </Link>
      ))}
    </aside>
  );
};
