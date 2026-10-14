import {
  BellIcon,
  HardDrivesIcon,
  HouseIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

const navitems = [
  { text: "Home", to: "/", icon: HouseIcon },
  { text: "Embarcados", to: "/embarcados", icon: HardDrivesIcon },
  { text: "Alertas", to: "/alertas", icon: BellIcon },
  { text: "Equipe", to: "/equipe", icon: UsersIcon },
];

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar px-4 py-6">
      <span className="px-2 text-lg font-bold tracking-tight text-sidebar-foreground">
        FlowTech
      </span>

      <nav className="flex flex-col gap-1">
        {navitems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            text={item.text}
            icon={item.icon}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ to, text, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
        )
      }
    >
      <Icon size={16} weight="bold" />
      {text}
    </NavLink>
  );
}
