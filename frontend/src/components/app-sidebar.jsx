import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  LucideLayoutDashboard,
  PieChart,
  Settings2,
  Table2Icon,
  Layers,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
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
    teams: [
      {
        name: "Uvolve AI",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Morningside AI",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Integraticus",
        logo: Command,
        plan: "Free",
      },
    ],
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
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
