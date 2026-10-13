import { ArrowLeftIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

const benefitCardContents = [
  {
    title: "Pórticos monitorados",
    number: "70",
    description: "distribuídos em 12 rodovias",
  },
  {
    title: "Falhas evitadas",
    number: "18",
    description: "neste mês, via alertas antecipados",
  },
  {
    title: "Disponibilidade",
    number: "99,8%",
    description: "uptime garantido da rede",
  },
  {
    title: "Tempo de respostas",
    number: "4 min",
    description: "tempo médio até o alerta",
  },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col overflow-hidden bg-sidebar px-6 py-10 sm:px-10 lg:flex-[1.3] lg:px-14 lg:py-12">
          <Link
            to="/"
            className="relative z-10 inline-flex w-fit items-center gap-2 self-start rounded-full border border-sidebar-foreground/20 bg-sidebar-foreground/5 px-4 py-2 text-sm font-semibold text-sidebar-foreground backdrop-blur-sm transition hover:bg-sidebar-foreground/10"
          >
            <ArrowLeftIcon />
            <span>Voltar</span>
          </Link>

          <div className="relative z-10 mt-10 max-w-md lg:mt-0">
            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-sidebar-foreground sm:text-4xl">
              O monitoramento dos seus pórticos, sob controle total.
            </h1>

            <span className="block text-[15px] leading-relaxed text-sidebar-foreground/70">
              Acesse a central do mantenedor e acompanhe a saúde de cada pórtico
              Free Flow em tempo real, com alertas antes que a operação seja
              afetada.
            </span>
          </div>

          <div className="relative z-10 mt-10 grid grid-cols-2 gap-3 lg:mt-auto">
            {benefitCardContents.map((item) => (
              <BenefitCard
                key={item.title}
                title={item.title}
                number={item.number}
                description={item.description}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-8 lg:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ title, number, description }) {
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent px-4 py-3.5">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-sidebar-foreground/70">
        {title}
      </div>

      <div className="text-xl leading-none text-sidebar-foreground">
        {number}
      </div>

      <div className="mt-1.5 text-[11px] text-sidebar-foreground/70">
        {description}
      </div>
    </div>
  );
}
