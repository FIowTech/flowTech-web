import { EmbarcadoCreateForm } from "@/components/embarcados/forms/embarcado-create-form";
import { EmbarcadoEditForm } from "@/components/embarcados/forms/embarcado-edit-form";
import MetricasEmbarcado from "@/components/embarcados/metricas-embarcado";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useMetricasMock } from "@/hooks/useMetricasMock";
import {
  ArrowsCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
  MapPinIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { pegarStatusServidor } from "@/utils/status-servidor";

function obterLimites(servidor, componente, limiteMaxPadrao) {
  const parametro = servidor.parametros?.find(
    (item) =>
      item.status === 1 &&
      `${item.nome ?? ""} ${item.descricao ?? ""}`
        .toLowerCase()
        .includes(componente),
  );

  return {
    limiteMax:
      parametro?.limite_max ??
      servidor[`limite_max_${componente}`] ??
      limiteMaxPadrao,
    limiteMin: parametro?.limite_min ?? null,
  };
}

export default function EmbarcadosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idUrl = searchParams.get("id");

  const { empresa } = useFetchEmpresa();
  const {
    embarcados,
    isLoading: isLoadingEmbarcados,
    refetch,
  } = useFetchEmbarcados();
  const metricas = useMetricasMock();

  const [busca, setBusca] = useState("");
  const [expandidoId, setExpandidoId] = useState(idUrl);
  const [abaDetalhe, setAbaDetalhe] = useState("processos");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (idUrl) {
      setExpandidoId(idUrl);
    }
  }, [idUrl]);

  const handleVerNoMapa = (idEmbarcado) => {
    navigate(`/?selecionado=${idEmbarcado}`);
  };

  const embarcadosFiltrados = useMemo(() => {
    if (!embarcados) return [];

    const termo = busca.trim().toLowerCase();

    const filtrados = embarcados.filter((servidor) => {
      const endereco = servidor.endereco ?? {};
      const texto = [
        servidor.apelido,
        servidor.modelo,
        endereco.localidade,
        servidor.endereco_mac,
      ].join(" ");

      return texto.toLowerCase().includes(termo);
    });

    return filtrados.sort((a, b) => {
      const obterPeso = (servidorItem) => {
        const st = pegarStatusServidor(servidorItem);
        if (st === "critico") return 1;
        if (st === "alerta") return 2;
        return 3;
      };

      return obterPeso(a) - obterPeso(b);
    });
  }, [busca, embarcados]);

  return (
    <div className="w-full flex flex-col space-y-6">
      <Card className="bg-background flex flex-row items-center justify-between px-4 py-4 border border-border rounded-md">
        <div>
          <h2 className="block text-xs text-muted-foreground">Embarcados de</h2>
          <h1 className="font-heading text-xl font-semibold">
            {empresa && empresa.razao_social}
          </h1>
        </div>

        <Relogio />
      </Card>

      <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Embarcados encontrados (
            <span className="text-primary-hover font-heading font-semibold">
              {embarcadosFiltrados.length}
            </span>
            )
          </h2>

          <div className="flex items-center gap-2">
            <EmbarcadoCreateForm refetchHandler={refetch} />

            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
              disabled={isRefreshing}
              onClick={async () => {
                setIsRefreshing(true);
                await refetch();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
            >
              <ArrowsCounterClockwiseIcon className={isRefreshing} />
            </Button>
          </div>
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Buscar por apelido, modelo ou localidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoadingEmbarcados ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {embarcadosFiltrados.map((servidor) => {
              const isExpanded = String(expandidoId) === String(servidor.id_embarcado);
              const statusString = pegarStatusServidor(servidor);     
              return (
                <div key={servidor.id_embarcado} className="flex flex-col">
                  <div className="flex items-center justify-between bg-background border border-border rounded-md p-4 shadow-sm hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md border flex items-center justify-center ${
                        statusString === "critico" 
                          ? "border-red-500 text-red-500 bg-red-500/10" 
                          : statusString === "alerta" 
                          ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" 
                          : "border-green-500 text-green-500 bg-green-500/10"
                      }`}>
                        {statusString === "critico" || statusString === "alerta" ? (
                          <WarningCircleIcon className="w-5 h-5" />
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-semibold text-base">
                            {servidor.apelido}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            statusString === "critico" 
                              ? "border-red-500 text-red-500" 
                              : statusString === "alerta" 
                              ? "border-yellow-500 text-yellow-500" 
                              : "border-green-500 text-green-500"
                          }`}>
                            {statusString === "critico" ? "Crítico" : statusString === "alerta" ? "Atenção" : "Controlado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {servidor.endereco_mac ?? "Endereço MAC não informado"} | {servidor.modelo ?? "Nome do servidor"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                        title="Ver no Mapa / Localização"
                        onClick={() => handleVerNoMapa(servidor.id_embarcado)}
                      >
                        <MapPinIcon className="w-4 h-4" />
                      </Button>

                      <EmbarcadoEditForm embarcado={servidor} refetchHandler={refetch} />

                      <Button
                        variant="outline"
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() =>
                          setExpandidoId(isExpanded ? null : servidor.id_embarcado)
                        }
                      >
                        <span>Mais Detalhes</span>
                        {isExpanded ? <CaretUpIcon /> : <CaretDownIcon />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 p-4 border border-border rounded-md bg-background/50 flex flex-col space-y-4">
                      <div className="flex items-center justify-center gap-4 py-2 border-b border bg-background p-1 rounded-lg">
                        <div className="flex items-center justify-center gap-2 py-2 border-b border-border">
                          <button
                            type="button"
                            onClick={() => setAbaDetalhe("processos")}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer ${
                              abaDetalhe === "processos"
                                ? "bg-background border border-primary text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Processos
                          </button>
                          <button
                            type="button"
                            onClick={() => setAbaDetalhe("alertas")}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer ${
                              abaDetalhe === "alertas"
                                ? "bg-background border border-primary text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Alertas
                          </button>
                        </div>
                      </div>

                      {abaDetalhe === "processos" ? (
                        <MetricasEmbarcado
                          key={servidor.id_embarcado}
                          servidor={servidor}
                          metricasMock={metricas}
                          obterLimites={obterLimites}
                        />
                      ) : (
                        <div className="flex flex-col space-y-3 py-2">
                          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                            <span className="text-xs text-muted-foreground font-mono">19:04:30</span>
                            <span className="text-sm">CPU alerta: ultima medida: 85 | limite: 90%</span>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                            <span className="text-xs text-muted-foreground font-mono">19:02:15</span>
                            <span className="text-sm">RAM crítico: ultima medida: 95% | limite: 90%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}