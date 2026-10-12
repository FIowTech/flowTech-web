import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { Button } from "../ui/button";

export function Navbar() {
  const navitems = [
    { text: "Nossa Missão", href: "#nossa_missao" },
    { text: "Nossa Solução", href: "#nossa_solucao" },
    { text: "Recursos", href: "#recursos" },
  ];

  return (
    <header className="top-0 z-20 flex items-center justify-between border-b bg-background px-6 py-4 sm:px-10 lg:px-16">
      <span className="text-lg font-bold tracking-tight text-ink">
        FlowTech
      </span>

      <nav className="flex items-center gap-1 sm:gap-2">
        {navitems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            text={item.text}
            icon={item.icon}
          />
        ))}
      </nav>
      <Link to="/login">
        <Button className="p-4 hover:gap-2 hover:cursor-pointer">
          Ver plataforma
          <ArrowRightIcon size={16} weight="bold" />
        </Button>
      </Link>
    </header>
  );
}

function NavItem({ href, text }) {
  return (
    <a
      href={href}
      className="bg-transparent hover:bg-primary hover:text-primary-foreground transition-all py-1 px-2 rounded-sm"
    >
      <p>{text}</p>
    </a>
  );
}
