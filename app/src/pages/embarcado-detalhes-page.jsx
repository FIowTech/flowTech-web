import { MetricaCard } from "@/components/embarcados/detalhes/metrica-card";
import { NetworkCard } from "@/components/embarcados/detalhes/network-card";
import { TracesTable } from "@/components/embarcados/detalhes/traces-table";
import { LogsTable } from "@/components/embarcados/detalhes/logs-table";
import { Relogio } from "@/components/relogio";
import { useFetchEmbarcado } from "@/hooks/useFetchEmbarcado";
import { useFetchLogs } from "@/hooks/useFetchLogs";
import { useFetchMetricasLatest } from "@/hooks/useFetchMetricasLatest";
import { useFetchTraces } from "@/hooks/useFetchTraces";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = Number(import.meta.env.VITE_TABLE_PAGE_SIZE ?? 10);

const METRICA_ZERADA = {
  nome: "Sem dados",
  valor: 0,
  valorPct: 0,
  total: 100,
  status: "Normal",
  unidadeMedida: "",
  extra: { mensagem: "" },
};

const REDE_ZERADA = {
  nome: "Rede – Uso",
  valor: 0,
  total: null,
  valorPct: null,
  status: "Normal",
  unidadeMedida: "Mbps",
  extra: { upload: 0, download: 0, latencia: 0, mensagem: "" },
};

function formatarNumero(valor) {
  const num = Number(valor ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 10) / 10;
}

function adaptarMetricaBase(rawMetrica, fallbackNome, fallbackUnidade) {
  if (!rawMetrica) return null;

  return {
    nome: rawMetrica.nome || fallbackNome,
    valor: formatarNumero(rawMetrica.valor),
    valorPct: formatarNumero(rawMetrica.valor_pct),
    total: formatarNumero(rawMetrica.total) || 100,
    status: rawMetrica.situacao || "Normal",
    unidadeMedida: rawMetrica.unidade_medida || fallbackUnidade || "",
    extra: { mensagem: "" },
  };
}

function adaptarMetricasLatest(registro) {
  if (!registro?.componentes) {
    return {
      cpu: METRICA_ZERADA,
      ram: { ...METRICA_ZERADA, unidadeMedida: "GB" },
      disco: { ...METRICA_ZERADA, unidadeMedida: "GB" },
      rede: REDE_ZERADA,
      monitoramento: {
        cpuUso: false,
        ramUso: false,
        discoUso: false,
        redeDownload: false,
      },
    };
  }

  const cpuUso = registro.componentes?.cpu?.metricas?.uso;
  const ramUso = registro.componentes?.ram?.metricas?.uso;
  const discoUso = registro.componentes?.disco?.metricas?.uso;
  const redeDownload = registro.componentes?.rede?.metricas?.download;
  const redeUpload = registro.componentes?.rede?.metricas?.upload;

  const cpu = adaptarMetricaBase(cpuUso, "CPU – Uso", "%") ?? {
    ...METRICA_ZERADA,
    nome: "CPU – Uso",
    unidadeMedida: "%",
  };
  cpu.extra.mensagem = registro.componentes?.cpu
    ? `Núcleos: ${registro.componentes.cpu.qtd_nucleos_fisicos ?? 0} físicos • ${registro.componentes.cpu.qtd_nucleos_logicos ?? 0} lógicos`
    : "";

  const ram = adaptarMetricaBase(ramUso, "RAM – Uso", "GB") ?? {
    ...METRICA_ZERADA,
    nome: "RAM – Uso",
    unidadeMedida: "GB",
  };

  const disco = adaptarMetricaBase(discoUso, "Armazenamento", "GB") ?? {
    ...METRICA_ZERADA,
    nome: "Armazenamento",
    unidadeMedida: "GB",
  };

  const redeStatus = redeDownload?.situacao || redeUpload?.situacao || "Normal";
  const rede = {
    nome: "Rede – Uso",
    valor: formatarNumero(redeDownload?.valor ?? 0),
    total: null,
    valorPct: null,
    status: redeStatus,
    unidadeMedida: "Mbps",
    extra: {
      upload: formatarNumero(redeUpload?.valor ?? 0),
      download: formatarNumero(redeDownload?.valor ?? 0),
      latencia: formatarNumero(registro.componentes?.rede?.metricas?.latencia?.valor ?? 0),
      mensagem: "",
    },
  };

  return {
    cpu,
    ram,
    disco,
    rede,
    monitoramento: {
      cpuUso: !!cpuUso,
      ramUso: !!ramUso,
      discoUso: !!discoUso,
      redeDownload: !!redeDownload,
    },
  };
}

export default function EmbarcadosDetailsPage() {
  const { id } = useParams();
  const { embarcado, isLoading: isLoadingEmbarcado } = useFetchEmbarcado(id);
  const enderecoMac = embarcado?.endereco_mac;

  const [tracePeriodo, setTracePeriodo] = useState("1h");
  const [logPeriodo, setLogPeriodo] = useState("1h");
  const [traceSearch, setTraceSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [tracePage, setTracePage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const {
    metricas,
    isLoading: isLoadingMetricas,
    error: metricasError,
    refetch: refetchMetricas,
  } = useFetchMetricasLatest(enderecoMac);
  const {
    traces,
    isLoading: isLoadingTraces,
    error: tracesError,
    refetch: refetchTraces,
  } = useFetchTraces({ enderecoMac, periodo: tracePeriodo });
  const {
    logs,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs,
  } = useFetchLogs({ enderecoMac, periodo: logPeriodo });

  const embarcadoApelido = embarcado?.apelido ?? "Embarcado";
  const ultimoRegistroMetricas = metricas?.at(-1);
  const metricasAdaptadas = useMemo(
    () => adaptarMetricasLatest(ultimoRegistroMetricas),
    [ultimoRegistroMetricas],
  );

  const tracesFiltradas = useMemo(() => {
    const termo = traceSearch.trim().toLowerCase();
    if (!termo) return traces;

    return traces.filter((trace) =>
      [trace?.id_trace, trace?.timestamp_inicio, trace?.timestamp_fim]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [traceSearch, traces]);

  const logsFiltrados = useMemo(() => {
    const termo = logSearch.trim().toLowerCase();
    if (!termo) return logs;

    return logs.filter((log) =>
      [log?.mensagem, log?.timestamp]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [logSearch, logs]);

  const totalTracePages = Math.max(1, Math.ceil(tracesFiltradas.length / PAGE_SIZE));
  const totalLogPages = Math.max(1, Math.ceil(logsFiltrados.length / PAGE_SIZE));
  const tracePageAtual = Math.min(tracePage, totalTracePages);
  const logPageAtual = Math.min(logPage, totalLogPages);

  const tracesPaginadas = tracesFiltradas.slice(
    (tracePageAtual - 1) * PAGE_SIZE,
    tracePageAtual * PAGE_SIZE,
  );

  const logsPaginados = logsFiltrados.slice(
    (logPageAtual - 1) * PAGE_SIZE,
    logPageAtual * PAGE_SIZE,
  );

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Embarcado – Detalhes</p>
          <h2 className="text-xl font-bold">
            {isLoadingEmbarcado ? "Carregando..." : embarcadoApelido}
          </h2>
        </div>

        <Relogio />
      </div>

      {/* Seção - Métricas */}
      <div className="flex flex-col space-y-4">
        <p className="text-text-primary">
          Informações Gerais sobre {embarcadoApelido}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricaCard
            title={"Uso de CPU"}
            metrica={metricasError ? METRICA_ZERADA : metricasAdaptadas.cpu}
            variation="circle"
            isLoading={isLoadingMetricas}
            compact
            notMonitoredMessage={
              metricasAdaptadas.monitoramento.cpuUso
                ? null
                : "Componente CPU métrica uso não está sendo monitorado."
            }
          />
          <MetricaCard
            title={"Uso de RAM"}
            metrica={metricasError ? METRICA_ZERADA : metricasAdaptadas.ram}
            isLoading={isLoadingMetricas}
            compact
            notMonitoredMessage={
              metricasAdaptadas.monitoramento.ramUso
                ? null
                : "Componente RAM métrica uso não está sendo monitorado."
            }
          />
          <MetricaCard
            title={"Armazenamento"}
            metrica={metricasError ? METRICA_ZERADA : metricasAdaptadas.disco}
            isLoading={isLoadingMetricas}
            compact
            notMonitoredMessage={
              metricasAdaptadas.monitoramento.discoUso
                ? null
                : "Componente Disco métrica uso não está sendo monitorado."
            }
          />
          <NetworkCard
            title={"Banda de Rede"}
            network={metricasError ? REDE_ZERADA : metricasAdaptadas.rede}
            isLoading={isLoadingMetricas}
            compact
            notMonitoredMessage={
              metricasAdaptadas.monitoramento.redeDownload
                ? null
                : "Componente Rede métrica download não está sendo monitorado."
            }
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={refetchMetricas}>
            <ArrowsClockwiseIcon />
            Atualizar métricas
          </Button>
        </div>
      </div>

      {/* Seção - Traces */}
      <TracesTable
        traces={tracesPaginadas}
        isLoading={isLoadingTraces}
        error={tracesError}
        searchTerm={traceSearch}
        onSearchTermChange={(value) => {
          setTraceSearch(value);
          setTracePage(1);
        }}
        periodo={tracePeriodo}
        onPeriodoChange={(value) => {
          setTracePeriodo(value);
          setTracePage(1);
        }}
        onRefetch={refetchTraces}
        page={tracePageAtual}
        totalPages={totalTracePages}
        pageSize={PAGE_SIZE}
        onPrevPage={() => setTracePage((prev) => Math.max(1, prev - 1))}
        onNextPage={() =>
          setTracePage((prev) => Math.min(totalTracePages, prev + 1))
        }
      />

      {/* Seção - Logs */}
      <LogsTable
        logs={logsPaginados}
        isLoading={isLoadingLogs}
        error={logsError}
        searchTerm={logSearch}
        onSearchTermChange={(value) => {
          setLogSearch(value);
          setLogPage(1);
        }}
        periodo={logPeriodo}
        onPeriodoChange={(value) => {
          setLogPeriodo(value);
          setLogPage(1);
        }}
        onRefetch={refetchLogs}
        page={logPageAtual}
        totalPages={totalLogPages}
        pageSize={PAGE_SIZE}
        onPrevPage={() => setLogPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setLogPage((prev) => Math.min(totalLogPages, prev + 1))}
      />
    </div>
  );
}
