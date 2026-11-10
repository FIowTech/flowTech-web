import { GraficoLinha } from "@/components/dashboard/graficos";
import { MetricaPainel } from "@/components/dashboard/metrica-painel";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const cores = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

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

  // Atualiza o expandido se o parâmetro na URL mudar
  useEffect(() => {
    if (idUrl) {
      setExpandidoId(idUrl);
    }
  }, [idUrl]);

  // Função para redirecionar de volta para o mapa com aquele servidor selecionado
  const handleVerNoMapa = (idEmbarcado) => {
    navigate(`/?selecionado=${idEmbarcado}`);
  };

  // Ordenação e Filtro: Crítico (0/vermelho) -> Alerta (amarelo) -> OK (1/verde)
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

    // Ordena priorizando: Crítico (0) -> Atenção (2) -> Controlado/OK (1)
    return filtrados.sort((a, b) => {
      // Função auxiliar para atribuir peso de prioridade (quanto menor o número, mais acima ele fica)
      const obterPeso = (status) => {
        if (status === 0) return 1; // Crítico em primeiro
        if (status === 2) return 2; // Atenção em segundo
        return 3;                   // Controlado/OK por último (status 1 ou outros)
      };

      return obterPeso(a.status) - obterPeso(b.status);
    });
  }, [busca, embarcados]);

  // Média do disco simulada
  let somaDisco = 0;
  for (const valor of metricas.disco.usado) {
    somaDisco += valor;
  }
  const mediaDisco = (somaDisco / metricas.disco.usado.length).toFixed(1);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <Card className="bg-background flex flex-row items-center justify-between px-4 py-4 border border-border rounded-md">
        <div>
          <h2 className="block text-xs text-muted-foreground">Embarcados de</h2>
          <h1 className="font-heading text-xl font-semibold">
            {empresa && empresa.razao_social}
          </h1>
        </div>

        <Relogio />
      </Card>

      {/* Lista de Embarcados com Busca e Ordenação */}
      <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Embarcados encontrados (
            <span className="text-primary-hover font-heading font-semibold">
              {embarcadosFiltrados.length}
            </span>
            )
          </h2>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
              onClick={refetch}
            >
              <ArrowsCounterClockwiseIcon />
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
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
              const statusServidor = servidor.status ?? 1; // 0: Crítico, 1: Ok (exemplo)

              return (
                <div key={servidor.id_embarcado} className="flex flex-col">
                  {/* Card do Embarcado */}
                  <div className="flex items-center justify-between bg-background border border-border rounded-md p-4 shadow-sm hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      {/* Ícone de Status / Check */}
                      <div className={`p-2 rounded-md border flex items-center justify-center ${
                        statusServidor === 0 
                          ? "border-red-500 text-red-500 bg-red-500/10" 
                          : statusServidor === 2 
                          ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" 
                          : "border-green-500 text-green-500 bg-green-500/10"
                      }`}>
                        {statusServidor === 0 || statusServidor === 2 ? (
                          <WarningCircleIcon className="w-5 h-5" />
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Informações Básicas */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-semibold text-base">
                            {servidor.apelido}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            statusServidor === 0 
                              ? "border-red-500 text-red-500" 
                              : statusServidor === 2 
                              ? "border-yellow-500 text-yellow-500" 
                              : "border-green-500 text-green-500"
                          }`}>
                            {statusServidor === 0 ? "Crítico" : statusServidor === 2 ? "Atenção" : "Controlado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {servidor.endereco_mac ?? "Endereço MAC não informado"} | {servidor.modelo ?? "Nome do servidor"}
                        </p>
                      </div>
                    </div>

                    {/* Ações da Direita */}
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

                  {/* Seção Expansível com Gráficos / Alertas (Baseado na Dashboard) */}
                  {isExpanded && (
                    <div className="mt-2 p-4 border border-border rounded-md bg-background/50 flex flex-col space-y-4">
                      {/* Switch Processos | Alertas */}
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
                        <div className="grid gap-4 lg:grid-cols-2">
                          <MetricaPainel titulo="Métricas CPU" valor={metricas.cpu.atual}>
                            <GraficoLinha
                              labels={metricas.horarios}
                              linhas={[
                                {
                                  nome: "Uso de CPU",
                                  valores: metricas.cpu.valores,
                                  cor: cores.verde,
                                },
                              ]}
                              unidade="%"
                              max={100}
                              area
                            />
                          </MetricaPainel>

                          <MetricaPainel titulo="Métricas RAM" valor={metricas.ram.atual}>
                            <GraficoLinha
                              labels={metricas.horarios}
                              linhas={[
                                {
                                  nome: "Uso de RAM",
                                  valores: metricas.ram.valores,
                                  cor: cores.amarelo,
                                },
                              ]}
                              unidade="GiB"
                              area
                            />
                          </MetricaPainel>

                          <MetricaPainel titulo="Métricas Rede" valor={metricas.rede.atual}>
                            <GraficoLinha
                              labels={metricas.horarios}
                              linhas={[
                                {
                                  nome: "Download",
                                  valores: metricas.rede.download,
                                  cor: cores.verde,
                                },
                                {
                                  nome: "Upload",
                                  valores: metricas.rede.upload,
                                  cor: cores.cinza,
                                },
                              ]}
                              unidade="Mbps"
                            />
                          </MetricaPainel>

                          <MetricaPainel
                            titulo="Métricas Disco"
                            descricao="Média de espaço usado neste mês"
                            valor={mediaDisco + " GB"}
                          >
                            <GraficoLinha
                              labels={metricas.disco.dias}
                              linhas={[
                                {
                                  nome: "Disco usado",
                                  valores: metricas.disco.usado,
                                  cor: cores.verde,
                                },
                              ]}
                              unidade="GB"
                              max={metricas.disco.capacidade}
                              area
                            />
                          </MetricaPainel>
                        </div>
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