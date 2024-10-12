import { sessionQueryOptions } from "@/ui/utils/queryOptions";
import type { Session } from "@auth/core/types";
import { signOut } from "@hono/auth-js/react";
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Link } from "@tanstack/react-router";

const Profile = ({ session: { user } }: { session: Session }) => {
  return (
    <Dropdown
      placement="bottom-end"
      classNames={{
        content: "!bg-radial-1 bg-background",
      }}
    >
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          name={user?.name ?? "Anonymous"}
          color="primary"
          size="sm"
          src={user?.image ?? "https://i.pravatar.cc/150?u=a042581f4e29026704d"}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        itemClasses={{
          base: ["data-[hover=true]:bg-white/5"],
        }}
      >
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{user?.name}</p>
        </DropdownItem>
        <DropdownItem
          key="logout"
          onPress={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export const Navbar = () => {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);

  return (
    <header className="h-12 flex w-full justify-between items-center px-6 pt-3">
      <Link
        className="flex max-w-20 cursor-pointer gap-2"
        to="/downloader/$tabId"
        params={{ tabId: "links" }}
      >
        <p className="font-bold text-inherit">Rdebrid</p>
      </Link>

      {session && (
        <div className="items-center">
          <Profile session={session} />
        </div>
      )}
    </header>
  );
};
