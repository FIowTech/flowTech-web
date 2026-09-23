
export function Navbar() {
  const navitems = [
    { text: "Nossa Missão" , href: "index.html#nossa_missao"},
    { text: "Nossa Solução" , href: "index.html#nossa_solucao"},
    { text: "Recursos" , href: "index.html#recuros"},
    { text: "Contato" , href: "index.html#contato"},
  ];
  return (

    <header className="flex flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
    <span className="flex items-center">
      <h1 className="text-2xl font-bold">FlowTech</h1>
    </span>

    <nav className="flex flex-wrap justify-center gap-1 text-sm sm:gap-3 lg:gap-5">
      {navitems.map((item) => (
        <NavItem key={item.href} href={item.href} text={item.text}/>
      ))}
    <a href="login-cadastro.html" className="bg-green-500 rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-gray-100 sm:px-4">
      Entrar
    </a>
    </nav>
  </header>
 
    
  );
}

function NavItem({ href, text}){
  return ( 
    <a
    href={href}
    className="rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4">
      {text}
    </a>
    
  );
}



/*<header class="flex flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
    <span class="flex items-center">
      <h1 class="text-2xl font-bold">FlowTech</h1>
    </span>

    <nav class="flex flex-wrap justify-center gap-1 text-sm sm:gap-3 lg:gap-5">
      <a href="index.html#nossa_missao"
        class="rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4">Nossa Missão</a>
      <a href="index.html#produto"
        class="rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4">Nossa Solucão</a>
      <a href="index.html#recursos"
        class="rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4">Recursos</a>
      <a href="index.html#secao_cadastro"
        class="rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-green-500 sm:px-4">Contato</a>
      <a href="login-cadastro.html"
        class="bg-green-500 rounded px-3 py-2 transition duration-150 ease-in-out hover:bg-gray-100 sm:px-4">Entrar</a>
    </nav>
  </header>*/

/*NavItem parametros*/