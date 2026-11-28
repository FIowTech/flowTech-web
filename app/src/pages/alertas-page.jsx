import { useMemo, useState } from "react";
import SummaryCards from "@/components/dashboard/Agatha/cartoes-resumo";
import AlertTable from "@/components/dashboard/Agatha/tabela-alerta";
import { AlertDetails } from "@/components/dashboard/Agatha/alerta-detalhes";
import { useAuth } from "@/store/auth-store";
import { LABELS_NIVEIS_ACESSO } from "@/constants/labels-niveis-acesso";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FilePdfIcon } from "@phosphor-icons/react";
import { useFetchAlertas } from "@/hooks/useFetchAlertas";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useGerarRelatorio } from "@/hooks/useGerarRelatorio";

function normalizarEstado(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatarInicio(valor) {
  const match = String(valor ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  );

  if (!match) return valor || "—";

  const [, ano, mes, dia, hora, minuto] = match;
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

export default function AlertasPage() {
  const { gerarRelatorio, isLoading: isGerandoRelatorio } = useGerarRelatorio();
  const { alertas, isLoading, error } = useFetchAlertas();
  const { embarcados } = useFetchEmbarcados();
  const usuario = useAuth((state) => state.usuario);
  const cargo = LABELS_NIVEIS_ACESSO[usuario?.nivel_acesso ?? 2];

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const apelidosPorId = useMemo(
    () =>
      new Map(
        embarcados.map((embarcado) => [
          String(embarcado.id_embarcado),
          embarcado.apelido,
        ]),
      ),
    [embarcados],
  );

  const adaptedAlerts = useMemo(
    () =>
      alertas.map((alerta) => ({
        ...alerta,
        embarcado:
          apelidosPorId.get(String(alerta.id_embarcado)) ||
          alerta.endereco_mac ||
          String(alerta.id_embarcado),
        recurso: String(alerta.componente ?? "").toUpperCase(),
        estado: normalizarEstado(alerta.situacao),
        inicio: formatarInicio(alerta.data_inicio),
      })),
    [alertas, apelidosPorId],
  );

  const quantidadeAlerta = adaptedAlerts.filter(
    (alerta) => alerta.estado === "alerta",
  ).length;

  const quantidadeCritico = adaptedAlerts.filter(
    (alerta) => alerta.estado === "critico",
  ).length;

  const activeAlerts = adaptedAlerts.filter(
    (alerta) => alerta.estado !== "normal",
  );

  const filteredAlerts = useMemo(
    () =>
      selectedFilter
        ? activeAlerts.filter((alerta) => alerta.estado === selectedFilter)
        : activeAlerts,
    [activeAlerts, selectedFilter],
  );

  const handleFilter = (filtro) => {
    setSelectedFilter(filtro);
    setSelectedAlert(null);
  };

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
          onFilter={handleFilter}
          quantidadeAlerta={quantidadeAlerta}
          quantidadeCritico={quantidadeCritico}
        />
      </section>

      {/* Área principal */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Fila de alertas */}
        <div className="xl:col-span-3 min-w-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {error}
            </div>
          ) : (
            <AlertTable
              alerts={filteredAlerts}
              selectedAlert={selectedAlert}
              onSelectAlert={setSelectedAlert}
            />
          )}
        </div>

        {/* Detalhes do alerta */}
        <div className="min-w-0 flex flex-col gap-2">
          <AlertDetails alert={selectedAlert} />
        </div>
      </section>
    </div>
  );
}
