import { PhoneIcon } from "@phosphor-icons/react";
import { Link } from "react-router";

export function Navbar() {
  const navitems = [
    {
      text: "Nossa Missão",
      href: "#nossa_missao",
      icon: null,
    },
    { text: "Nossa Solução", href: "#nossa_solucao", icon: null },
    { text: "Recursos", href: "#recuros", icon: null },
    {
      text: "Contato",
      href: "#contato",
      icon: <PhoneIcon size={24} weight="duotone" />,
    },
  ];
  return (
    <header className="flex flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
      <span className="flex items-center">
        <h1 className="text-2xl font-bold">FlowTech</h1>
      </span>

      <nav className="flex flex-wrap justify-center gap-1 text-sm sm:gap-3 lg:gap-5">
        {navitems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            text={item.text}
            icon={item.icon}
          />
        ))}
        <Link
          to="/login"
          className="bg-green-500 rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-gray-100 sm:px-4"
        >
          Entrar
        </Link>
      </nav>
    </header>
  );
}

function NavItem({ href, text, icon }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4"
    >
      <p>{text}</p> {icon}
    </Link>
  );
}
