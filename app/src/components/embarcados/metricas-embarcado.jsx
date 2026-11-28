import { GraficoLinha } from "@/components/dashboard/graficos";
import { MetricaPainel } from "@/components/dashboard/metrica-painel";
import { useAuth } from "@/store/auth-store";
import { useEffect, useState } from "react";
import ModalDetalhesEmbarcado from "@/pages/embarcado-aba";

const COMPONENTES = ["cpu", "ram", "disco", "rede"];
const CORES = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

function formatarNumero(valor) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(valor);
}

function valorMetrica(metrica, percentual = true) {
  const valor = percentual ? metrica?.valor_pct ?? metrica?.valor : metrica?.valor;
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

function metricaRedeValida(metrica) {
  return typeof metrica?.valor === "number" && Number.isFinite(metrica.valor) && metrica.valor !== 0;
}

function ultimaMetricaRedeValida(leituras, chave) {
  return [...leituras]
    .reverse()
    .map((leitura) => leitura.componentes?.rede?.metricas?.[chave])
    .find(metricaRedeValida);
}

function preservarUltimasMetricasRede(leituras, componentes) {
  const rede = componentes.rede;
  if (!rede) return componentes;

  const metricas = { ...(rede.metricas ?? {}) };
  for (const chave of ["download", "upload", "latencia"]) {
    if (!metricaRedeValida(metricas[chave])) {
      const ultimaValida = ultimaMetricaRedeValida(leituras, chave);
      if (ultimaValida) metricas[chave] = ultimaValida;
      else delete metricas[chave];
    }
  }

  return { ...componentes, rede: { ...rede, metricas } };
}

function limitePositivo(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function criarMetricaReal(componente, serie, limitesPadrao) {
  const leituras = serie?.leituras ?? [];
  if (!leituras.length) return null;

  const definicoes = {
    cpu: [
      { grupo: "cpu", chave: "uso", nome: "Uso de CPU", percentual: true, unidade: "%", cor: CORES.verde },
    ],
    ram: [
      { grupo: "ram", chave: "uso", nome: "Uso de RAM", percentual: true, unidade: "%", cor: CORES.amarelo },
      { grupo: "swap", chave: "uso", nome: "Uso de SWAP", percentual: true, unidade: "%", cor: CORES.cinza },
    ],
    disco: [
      { grupo: "disco", chave: "uso", nome: "Uso de disco", percentual: true, unidade: "%", cor: CORES.verde },
    ],
    rede: [
      { grupo: "rede", chave: "download", nome: "Download", percentual: false, unidade: "Mbps", cor: CORES.verde, spanGaps: true },
      { grupo: "rede", chave: "upload", nome: "Upload", percentual: false, unidade: "Mbps", cor: CORES.cinza, spanGaps: true },
    ],
  };
  const linhas = definicoes[componente]
    .map((definicao) => {
      const valores = leituras.map((leitura) =>
        valorMetrica(
          leitura.componentes?.[definicao.grupo]?.metricas?.[definicao.chave],
          definicao.percentual,
        ),
      ).map((valor) => (componente === "rede" && valor === 0 ? null : valor));
      const atual = [...valores].reverse().find((valor) => valor !== null);
      const metricaAtual =
        leituras.at(-1)?.componentes?.[definicao.grupo]?.metricas?.[definicao.chave];
      return {
        ...definicao,
        valores,
        atual,
        limiteMax: metricaAtual?.limite_max,
        limiteMin: metricaAtual?.limite_min,
      };
    })
    .filter((linha) => linha.valores.some((valor) => valor !== null));
  if (!linhas.length) return null;

  const principal = linhas[0];
  const numerosValidos = principal.valores.filter((valor) => valor !== null);
  const media =
    numerosValidos.length > 0
      ? numerosValidos.reduce((soma, valor) => soma + valor, 0) / numerosValidos.length
      : null;
  const unidade = principal.unidade;
  const atualSnapshot = leituras.at(-1);
  const atualComponentes = atualSnapshot?.componentes ?? {};
  const detalhes =
    componente === "rede"
      ? preservarUltimasMetricasRede(leituras, atualComponentes)
      : atualComponentes;
  const atual =
    componente === "rede"
      ? linhas
          .map(
            (linha) =>
              `${linha.nome}: ${formatarNumero(linha.atual)}${linha.unidade ? ` ${linha.unidade}` : ""}`,
          )
          .join(" · ")
      : `${formatarNumero(componente === "disco" ? media : principal.atual)}${unidade ? ` ${unidade}` : ""}`;

  return {
    labels: leituras.map((leitura) => leitura.timestamp?.slice(11, 19) || leitura.timestamp),
    linhas,
    detalhes,
    atual,
    descricao:
      componente === "disco"
        ? `Média percentual das ${numerosValidos.length} leituras recentes`
        : undefined,
    limiteMax:
      limitePositivo(limitesPadrao.limiteMax) ??
      limitePositivo(principal.limiteMax) ??
      limitePositivo(limitesPadrao.limiteMaxPadrao) ??
      (unidade === "%" ? 100 : undefined),
    limiteMin:
      limitePositivo(limitesPadrao.limiteMin) ??
      limitePositivo(principal.limiteMin),
    unidade,
    max: unidade === "%" ? 100 : undefined,
  };
}

function criarMetricaSemDados(componente) {
  const unidade = componente === "rede" ? "Mbps" : "%";
  return {
    labels: [],
    linhas: [],
    atual: "Sem dados reais",
    unidade,
    max: unidade === "%" ? 100 : undefined,
  };
}

export default function MetricasEmbarcado({ servidor, obterLimites }) {
  const token = useAuth((state) => state.token);
  const [series, setSeries] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [abaInicialModal, setAbaInicialModal] = useState("cpu");

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;

    async function carregarSeries() {
      const resultado = {};
      await Promise.all(
        COMPONENTES.map(async (componente) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_BASE_API_URL}/gold/embarcados/${servidor.id_embarcado}/serie?componente=${componente}&horas=24&pontos=30`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              },
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.message || `Falha ao buscar série de ${componente}.`);
            }

            resultado[componente] = data.result;
          } catch (error) {
            if (!controller.signal.aborted) {
              console.warn(
                `[MetricasEmbarcado] Falha ao buscar dados reais de ${componente} do embarcado ${servidor.id_embarcado}:`,
                error.message || error,
              );
              resultado[componente] = null;
            }
          }
        }),
      );

      if (ativo) setSeries(resultado);
    }

    if (token && servidor.id_embarcado) carregarSeries();

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [servidor.id_embarcado, token]);

  const metricas = Object.fromEntries(
    COMPONENTES.map((componente) => {
      const real = criarMetricaReal(
        componente,
        series[componente],
        obterLimites(servidor, componente, componente === "cpu" ? 90 : componente === "ram" ? 80 : 4500),
      );
      return [componente, real ?? criarMetricaSemDados(componente)];
    }),
  );

  const abrirModal = (componente) => {
    setAbaInicialModal(componente);
    setModalAberto(true);
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {COMPONENTES.map((componente) => {
          const metrica = metricas[componente];
          const titulo = `Métricas ${componente.toUpperCase()}`;

          return (
            <div
              key={componente}
              onClick={() => abrirModal(componente)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <MetricaPainel
                titulo={titulo}
                valor={metrica.atual}
                descricao={metrica.descricao}
              >
                <GraficoLinha
                  labels={metrica.labels}
                  linhas={metrica.linhas}
                  unidade={metrica.unidade}
                  max={metrica.max}
                  area
                  limiteMax={metrica.limiteMax}
                  limiteMin={metrica.limiteMin}
                />
              </MetricaPainel>
            </div>
          );
        })}
      </div>

      <ModalDetalhesEmbarcado
        key={abaInicialModal}
        servidor={servidor}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        abaInicial={abaInicialModal}
        metricas={metricas}
      />
    </>
  );
}
