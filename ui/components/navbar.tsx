import { sessionQueryOptions } from "@/ui/utils/queryOptions";
import type { Session } from "@auth/core/types";
import { signOut } from "@hono/auth-js/react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Navbar as NextUINavbar,
} from "@nextui-org/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ForwardLink } from "./forward-link";

const Profile = ({ session: { user } }: { session: Session }) => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          name={user?.name ?? "Anonymous"}
          color="primary"
          size="sm"
          src={user?.image ?? "https://i.pravatar.cc/150?u=a042581f4e29026704d"}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{user?.name}</p>
        </DropdownItem>
        <DropdownItem key="team_settings">Settings</DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
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
    <NextUINavbar
      maxWidth="full"
      position="static"
      isBlurred={false}
      classNames={{
        base: "bg-transparent",
      }}
    >
      <NavbarContent>
        <NavbarBrand className="flex max-w-20 cursor-pointer gap-2" as={ForwardLink} to="/">
          <p className="font-bold text-inherit">Debrid</p>
        </NavbarBrand>
      </NavbarContent>

      {session && (
        <NavbarContent className="items-center" justify="end">
          <NavbarItem>
            <Profile session={session} />
          </NavbarItem>
        </NavbarContent>
      )}
    </NextUINavbar>
  );
};
