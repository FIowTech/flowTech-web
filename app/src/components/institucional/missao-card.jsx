const pilares = [
  {
    icone: "/assets/hardware.svg",
    titulo: "Visibilidade de hardware",
    texto:
      "Captura contínua de métricas críticas de CPU, RAM, disco e rede. Acompanhe a saúde de cada máquina em tempo real e elimine gargalos de processamento.",
  },
  {
    icone: "/assets/alertas.svg",
    titulo: "Coleta e alertas automáticos",
    texto:
      "Automação na extração de dados do sistema sem carregar a máquina. Receba alertas antes que um pico de consumo derrube a sua central.",
  },
  {
    icone: "/assets/expansao.svg",
    titulo: "Expansão controlada",
    texto:
      "Monitore de uma a centenas de máquinas simultaneamente. Adicione novas centrais ao FlowTech mantendo a estabilidade e o histórico de dados intactos.",
  },
];

export function MissaoCard() {
    return(
      <div className="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-t-0">
        {pilares.map((p) => (
          <div
            key={p.titulo}
            className="flex flex-col gap-3 py-8 first:pr-0 last:pl-0 sm:py-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"
          >
            <img src={p.icone} alt="" className="h-8 w-8" />

            <h3 className="text-lg font-semibold">
              {p.titulo}
            </h3>

            <p className="text-muted">
              {p.texto}
            </p>
          </div>
        ))}
      </div>
    )
}