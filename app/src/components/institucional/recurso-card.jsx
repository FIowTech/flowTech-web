const recursos = [
  {
    titulo: "Segurança ponta a ponta",
    texto: "Transmissão de dados criptografada e autenticação rigorosa em cada nó de monitoramento.",
  },
  {
    titulo: "Latência ultra-baixa",
    texto: "Sincronização em tempo real para tomada de decisões antes que anomalias afetem o fluxo.",
  },
  {
    titulo: "Relatórios consolidados",
    texto: "Exporte resumos analíticos periódicos de conformidade e uso de hardware facilmente.",
  },
  {
    titulo: "Integração modular",
    texto: "APIs flexíveis para conectar o FlowTech diretamente aos seus sistemas legados de rodovias.",
  },
];

export function RecursoCard() {
    return( 
      <div>
      <h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
        Recursos da plataforma
      </h2><div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          {recursos.map((r) => (
            <div key={r.titulo} className="border-t border-ink/15 pt-5">
              <h3 className="text-lg font-semibold">{r.titulo}</h3>
              <p className="mt-2 text-muted">{r.texto}</p>
            </div>
          ))}
        </div></div>
    )
}





