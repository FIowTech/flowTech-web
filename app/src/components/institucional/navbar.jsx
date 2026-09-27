import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router";

export function Navbar() {
  const navitems = [
    {
      text: "Nossa Missão",
      href: "#nossa_missao",
      icon: null,
    },
    { text: "Nossa Solução", href: "#nossa_solucao", icon: null },
    { text: "Recursos", href: "#recursos", icon: null },
  ];

  return (
    <header className="top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-6 py-4 backdrop-blur sm:px-10 lg:px-16">
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
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#255840]"
      >
        Ver plataforma
        <ArrowRightIcon size={16} weight="bold" />
      </Link>
    </header>

  );
}

function NavItem({ href, text, icon }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4"
    >
      <p>{text}</p> {icon}
    </a>
  );
}