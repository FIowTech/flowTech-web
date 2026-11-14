export default function AlertasPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Central de Triagem de Alertas
        </h1>

        <p className="text-sm text-muted-foreground">
          FlowTech · Embarcados do pórtico free flow · Agatha Silva
        </p>
      </header>

      {/* Resumo dos alertas */}
      <section>
        {/* Cards serão adicionados aqui */}
      </section>

      {/* Área principal */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Fila de alertas */}
        <div className="xl:col-span-2">
          {/* Tabela será adicionada aqui */}
        </div>

        {/* Detalhes do alerta */}
        <div>
          {/* Detalhes serão adicionados aqui */}
        </div>
      </section>
    </div>
  );
}