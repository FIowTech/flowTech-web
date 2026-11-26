import { FiltrosMapa } from "@/components/dashboard/filtros-mapa";
import {
  ResumoCard,
  ResumoTotal,
  StatusCount,
} from "@/components/dashboard/resumo-card";
import { SeletorVisao } from "@/components/dashboard/seletor-visao";
import { ServidorBusca } from "@/components/dashboard/servidor-busca";
import { ServidorDetalhes } from "@/components/dashboard/servidor-detalhes";
import { ServidorMapa } from "@/components/dashboard/servidor-mapa";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useAuth } from "@/store/auth-store";
import {
  listarRegioes,
  pegarRegiao,
  TODAS_AS_REGIOES,
} from "@/utils/regioes";
import { pegarStatusServidor } from "@/utils/status-servidor";
import { BellIcon, CameraIcon, HardDrivesIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

// Variáveis mockadas e temporárias

const cores = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

const filtrosIniciais = { regiao: TODAS_AS_REGIOES, status: [] };


export default function HomePage() {
  const usuario = useAuth((state) => state.usuario);
  const { empresa } = useFetchEmpresa();
  const { embarcados, resumo, isLoading } = useFetchEmbarcados();
  // Preferir usar os totais já calculados pelo backend (gold/resumo)
  const totaisGold = resumo?.totais;

  const totalControlado = totaisGold ? totaisGold.controlado : embarcados.filter((e) => pegarStatusServidor(e) === "controlado").length;
  const totalAlerta = totaisGold ? totaisGold.alerta : embarcados.filter((e) => pegarStatusServidor(e) === "alerta").length;
  const totalCritico = totaisGold ? totaisGold.critico : embarcados.filter((e) => pegarStatusServidor(e) === "critico").length;
  const totalSemDados = totaisGold ? totaisGold.sem_dados : embarcados.filter((e) => pegarStatusServidor(e) === "sem_dados").length;


  const [searchParams] = useSearchParams();
  const idUrl = searchParams.get("selecionado");

  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState(idUrl ? Number(idUrl) : null);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [visao, setVisao] = useState("mapa"); // "mapa" ou "calor"

  const handleBuscaChange = (e) => setBusca(e.target.value);
  const handleLimparFiltros = () => setFiltros(filtrosIniciais);

  const regioes = useMemo(() => listarRegioes(embarcados), [embarcados]);

  // Contagens reais (mesma regra do mapa, então os números sempre batem com as cores)
const contar = (status) =>
  embarcados.filter((s) => pegarStatusServidor(s) === status).length;
const totalVerde = contar("controlado");
const totalAmarelo = contar("alerta");
const totalVermelho = contar("critico");

// Região com mais servidores críticos (desempate: mais em alerta)
const regiaoCritica = useMemo(() => {
  const porRegiao = new Map();

  for (const servidor of embarcados) {
    const nome = pegarRegiao(servidor);
    if (!nome) continue;

    const regiao = porRegiao.get(nome) ?? { nome, amarelo: 0, vermelho: 0, total: 0 };
    regiao.total++;

    // usar nivel preferencialmente (vindo do gold), senão fallback para pegarStatusServidor
    const nivel = servidor.nivel ?? (servidor.status_front ?? pegarStatusServidor(servidor));

    if (nivel === "alerta") regiao.amarelo++;
    if (nivel === "critico") regiao.vermelho++;

    porRegiao.set(nome, regiao);
  }

  return (
    [...porRegiao.values()]
      .filter((r) => r.amarelo + r.vermelho > 0)
      .sort((a, b) => b.vermelho - a.vermelho || b.amarelo - a.amarelo)[0] ?? null
  );
}, [embarcados]);


const atualizadoEm = resumo?.atualizado_em
  ? new Date(resumo.atualizado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  : "—";
const capturas = resumo?.capturas ?? { recebidas: 0, esperadas: 0, porticos: 0 };

  const filtrosAtivos =
    (filtros.regiao !== TODAS_AS_REGIOES ? 1 : 0) + filtros.status.length;


  const servidoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return embarcados.filter((servidor) => {
      const endereco = servidor.endereco ?? {};
      const texto = [
        servidor.apelido,
        servidor.modelo,
        endereco.localidade,
      ].join(" ");

      const passouBusca = texto.toLowerCase().includes(termo);

      const passouRegiao =
        filtros.regiao === TODAS_AS_REGIOES ||
        pegarRegiao(servidor) === filtros.regiao;

      const passouStatus =
        filtros.status.length === 0 ||
        filtros.status.includes(pegarStatusServidor(servidor));

      return passouBusca && passouRegiao && passouStatus;
    });
  }, [busca, embarcados, filtros]);

  const selecionado =
    servidoresFiltrados.find(
      (servidor) => servidor.id_embarcado === selecionadoId,
    ) ?? servidoresFiltrados[0];

  // Contagem real. No banco o status é 1 (controlado) ou 0 (crítico).
  // const totalVerde = embarcados.filter(
  //   (servidor) => servidor.status === 1,
  // ).length;
 

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Olá, {usuario?.nome ?? "usuário"}!</p>
          <h2 className="text-xl">{empresa?.razao_social}</h2>
        </div>

        <Relogio />
      </div>

      {/* resumo */}
<section className="grid grid-cols-1 gap-4 md:grid-cols-2">

<ResumoCard
  titulo="Situação dos embarcados"
  icon={HardDrivesIcon}
  atualizadoEm={atualizadoEm}
>
  <div className="flex flex-row flex-wrap items-center gap-4">
    <StatusCount status="verde" quantidade={totalControlado} />
    <StatusCount status="amarelo" quantidade={totalAlerta} />
    <StatusCount status="vermelho" quantidade={totalCritico} />
  </div>

  <p className="mt-2 text-xs text-muted-foreground">
    {totalSemDados} sem dados
  </p>

  <ResumoTotal total={embarcados.length} />
</ResumoCard>
<ResumoCard
  titulo="Região mais crítica"
  icon={BellIcon}
  tom="destructive"
  atualizadoEm={atualizadoEm}
>

  <div className="mt-2">
    <p className="text-lg font-semibold">
      {regiaoCritica?.nome ?? "Nenhuma região crítica"}
    </p>

    <p className="text-xs text-muted-foreground">
      {regiaoCritica
        ? `${regiaoCritica.total} embarcados na região`
        : "Nenhuma ocorrência de alerta ou criticidade"}
    </p>
  </div>
</ResumoCard>


      </section>

      {/* busca + mapa + detalhes */}
      <section className="flex flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ServidorBusca
            value={busca}
            onChange={handleBuscaChange}
            onFiltrarClick={() => setFiltrosAbertos(true)}
            filtrosAtivos={filtrosAtivos}
          />

          {filtrosAtivos > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Mostrando {servidoresFiltrados.length} de {embarcados.length}{" "}
                servidores
              </span>

              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleLimparFiltros}
              >
                Limpar filtros
              </Button>
            </div>
          )}

          <SeletorVisao value={visao} onChange={setVisao} />

          {isLoading ? (
            <div className="flex h-105 items-center justify-center rounded-xl bg-background ring-1 ring-foreground/10 lg:h-full lg:min-h-105">
              <Spinner />
            </div>
          ) : (
            <ServidorMapa
              servidores={servidoresFiltrados}
              selecionadoId={selecionado?.id_embarcado}
              onSelecionar={setSelecionadoId}
              visao={visao}
            />
          )}
        </div>

        <ServidorDetalhes servidor={selecionado} />
      </section>

      <FiltrosMapa
        open={filtrosAbertos}
        onOpenChange={setFiltrosAbertos}
        regioes={regioes}
        filtros={filtros}
        onAplicar={setFiltros}
      />
{/* 
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Métricas de {selecionado?.apelido ?? "—"}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-2">
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
        </CardContent>
      </Card> */}

    </div>
  );
}
