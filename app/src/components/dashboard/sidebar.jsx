import logoFlowtech from "@/assets/flow-icon-light.png";
import logoFlowtechDark from "@/assets/flow-icon-dark.png"
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";
import {
  BellIcon,
  HardDrivesIcon,
  HouseIcon,
  SignOutIcon,
  UsersIcon,
  GearIcon
} from "@phosphor-icons/react";
import { NavLink, useNavigate } from "react-router";

import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider";


const navitems = [
  { text: "Home", to: "/", icon: HouseIcon },
  { text: "Embarcados", to: "/embarcados", icon: HardDrivesIcon },
  // { text: "Alertas", to: "/alertas", icon: BellIcon },
  { text: "Equipe", to: "/equipe", icon: UsersIcon },
  { text: "Configurações", to: "/configuracoes", icon: GearIcon },
];

// 0 - dev | 1 - adm | 2 - usuário comum 
const nomesNivelAcesso = {
  0: "Desenvolvedor",
  1: "Administrador",
  2: "Usuário",
};



export function Sidebar() {
  const { theme, setTheme } = useTheme();
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 bg-background-dark px-4 py-6 sm:sticky sm:top-0 sm:h-dvh sm:w-56 sm:border-r sm:border-border">
      <div className="flex items-center gap-2 px-2">
        <img src={theme=="light" ? logoFlowtech : logoFlowtechDark} alt="FlowTech Logo" className="w-7" />

        <span className="text-xl font-bold tracking-tight">FlowTech</span>
      </div>

      <nav className="flex flex-col gap-1 h-full justify-between">
        <div className="flex flex-col h-full">
        {navitems.slice(0,3).map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            text={item.text}
            icon={item.icon}
          />
        ))}
        </div>

        <div className="flex flex-col gap-1">

        <div className="flex items-center border rounded-md px-3 py-2 text-xs font-medium transition-all justify-between">
        <span>Light Mode</span>
      <Switch id="themeColor" checked={theme=="light" ? true : false } onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")} />
      </div>

          <SidebarItem
            to={navitems[3].to}
            text={navitems[3].text}
            icon={navitems[3].icon}
          />
        </div>
      
      </nav>

      <UsuarioRodape />
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
          "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-text-primary hover:bg-primary/10",
        )
      }
    >
      <Icon size={14} />
      {text}
    </NavLink>
  );
}

  function UsuarioRodape() {
  const navigate = useNavigate();

  const usuario = useAuth((state) => state.usuario);
  const isPending = useAuth((state) => state.isPending);
  const logout = useAuth((state) => state.logout);

  const cargo = nomesNivelAcesso[usuario?.nivel_acesso] ?? usuario?.email;

  const handleSairClick = async () => {
    const result = await logout();

    if (!result.success) {
      toast.add({ description: result.error, type: "error" });
      return;
    }

    toast.add({ description: "Você saiu da conta.", type: "success" });
    navigate("/", { replace: true });
  };

  return (
    <div className="mt-auto flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex items-center gap-3 px-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-light text-[11px] font-semibold">
          {pegarIniciais(usuario?.nome)}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {usuario?.nome ?? "Usuário"}
          </p>

          <p className="truncate text-xs text-muted-foreground">{cargo}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        className="w-full justify-between bg-(--destructive-foreground) px-3 text-xs hover:bg-(--destructive-foreground)/70"
        onClick={handleSairClick}
        disabled={isPending}
      >
        Sair
        {isPending ? <Spinner /> : <SignOutIcon />}
      </Button>
    </div>
  );
}

// "Kevin Augusto" -> "KA"
function pegarIniciais(nome) {
  if (!nome) return "?";

  const partes = nome.split(" ");
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";

  return (primeira + ultima).toUpperCase();
}
