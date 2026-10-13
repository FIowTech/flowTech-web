const kpis = [
  { titulo: "CPU", valor: "30%" },
  { titulo: "RAM", valor: "170MB" },
  { titulo: "Disco", valor: "3.1GB" },
  { titulo: "Rede", valor: "389.4KB/s" },
];

export function MetricasCard() {
  return (
    <div className="grid grid-cols-2 gap-6 font-mono sm:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.titulo}>
          <p className="text-2xl font-semibold text-foreground">{kpi.valor}</p>
          <p className="mt-0.5 font-sans text-sm text-muted-foreground">
            {kpi.titulo}
          </p>
        </div>
      ))}
    </div>
  );
}
