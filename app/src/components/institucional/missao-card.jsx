import { ArrowsOutIcon, CpuIcon, SirenIcon } from "@phosphor-icons/react";

const pilares = [
  {
    icon: <CpuIcon size={24} />,
    titulo: "Visibilidade de hardware",
    texto:
      "Captura contínua de métricas críticas de CPU, RAM, disco e rede. Acompanhe a saúde de cada máquina em tempo real e elimine gargalos de processamento.",
  },
  {
    icon: <SirenIcon size={24} />,
    titulo: "Coleta e alertas automáticos",
    texto:
      "Automação na extração de dados do sistema sem carregar a máquina. Receba alertas antes que um pico de consumo derrube a sua central.",
  },
  {
    icon: <ArrowsOutIcon size={24} />,
    titulo: "Expansão controlada",
    texto:
      "Monitore de uma a centenas de máquinas simultaneamente. Adicione novas centrais ao FlowTech mantendo a estabilidade e o histórico de dados intactos.",
  },
];

export function MissaoCard() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-t-0">
      {pilares.map((p) => (
        <div
          key={p.titulo}
          className="flex flex-col gap-3 py-8 first:pr-0 last:pl-0 sm:py-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"
        >
          <span className="p-2 rounded-md border border-primary bg-primary-foreground text-primary w-fit h-fit">
            {p.icon}
          </span>

          <h3 className="text-lg font-semibold text-foreground">{p.titulo}</h3>

          <p className="text-muted-foreground">{p.texto}</p>
        </div>
      ))}
    </div>
  );
}
