import * as React from "react";
import {
  LucideLayoutDashboard,
  PieChart,
  Settings2,
  Table2Icon,
  Layers,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AppLogo } from "@/components/app-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import useStore from "@/store";

export function AppSidebar({ ...props }) {
  const { user } = useStore((state) => state.auth);

  const data = {
    user: {
      name: user ? user.username : null,
      email: user ? user.email : null,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LucideLayoutDashboard,
        isActive: true,
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: Table2Icon,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: PieChart,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Layers,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
