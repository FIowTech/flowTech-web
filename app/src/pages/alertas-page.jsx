import { useState } from "react";
import SummaryCards from "@/components/dashboard/Agatha/cartoes-resumo";
import AlertTable from "@/components/dashboard/Agatha/tabela-alerta";
import { alerts } from "@/data/alerts";
import { AlertDetails } from "@/components/dashboard/Agatha/alerta-detalhes";
//import Encaminhar from "@/components/dashboard/Agatha/encaminhar";
import { useAuth } from "@/store/auth-store";
import { LABELS_NIVEIS_ACESSO } from "@/constants/labels-niveis-acesso";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FilePdfIcon } from "@phosphor-icons/react";
import { useGerarRelatorio } from "@/hooks/useGerarRelatorio";
export default function AlertasPage() {
const { gerarRelatorio, isLoading: isGerandoRelatorio } = useGerarRelatorio();
const usuario = useAuth((state) => state.usuario);
const cargo = LABELS_NIVEIS_ACESSO[usuario?.nivel_acesso ?? 2];
const [selectedFilter, setSelectedFilter] = useState(null);
const [selectedAlert, setSelectedAlert] = useState(null);

const quantidadeAlerta = alerts.filter(
    (alert) => alert.estado === "alerta"
  ).length;

  const quantidadeCritico = alerts.filter(
    (alert) => alert.estado === "critico"
  ).length;

  // Filtra os alertas exibidos na tabela
  const activeAlerts = alerts.filter(
    (alert) => alert.estado !== "normal"
  );

  const filteredAlerts = selectedFilter
    ? activeAlerts.filter((alert) => alert.estado === selectedFilter)
    : activeAlerts;

  // Por enquanto o Java recebe apenas o primeiro da lista, como teste.
  const primeiroApelido = filteredAlerts[0]?.embarcado;

  


    
return (
  <div className="flex flex-col gap-6">
    {/* Cabeçalho */}
 <header className="flex flex-col gap-1">
  <Card className="bg-background flex-row items-center justify-between px-4">
  <div>
    <h2 className="block text-xs text-muted-foreground">
      Logado como
    </h2>

    <h1 className="font-heading text-xl font-semibold">
      <span className="text-primary-hover">
        {usuario?.nome} • {cargo}
      </span>
    </h1>
  </div>

  <div className="flex items-center gap-3">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => gerarRelatorio(primeiroApelido)}
      disabled={isGerandoRelatorio}
    >
      {isGerandoRelatorio ? (
        <>
          <Spinner />
          Gerando...
        </>
      ) : (
        <>
          <FilePdfIcon />
          Gerar relatório de lista
        </>
      )}
    </Button>

    <Relogio />
  </div>
</Card>
</header>

    {/* Cards de resumo */}
    <section>
      <SummaryCards
        selectedFilter={selectedFilter}
        onFilter={setSelectedFilter}
        quantidadeAlerta={quantidadeAlerta}
        quantidadeCritico={quantidadeCritico}
      />
    </section>

    {/* Área principal */}
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      {/* Fila de alertas */}
      <div className="xl:col-span-3 min-w-0">
        <AlertTable
          alerts={filteredAlerts}
          selectedAlert={selectedAlert}
          onSelectAlert={setSelectedAlert}
        />
      </div>

      {/* Detalhes do alerta */}
      
      <div className="min-w-0 flex flex-col gap-2">
  <AlertDetails alert={selectedAlert} />
  {/*<Encaminhar alert={selectedAlert} />*/}
</div>
    </section>
  </div>
);

}