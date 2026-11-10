import { FiltrosMapa } from "@/components/dashboard/filtros-mapa";
import {
  ResumoCard,
  ResumoTotal,
  StatusCount,
} from "@/components/dashboard/resumo-card";
import { ServidorBusca } from "@/components/dashboard/servidor-busca";
import { ServidorDetalhes } from "@/components/dashboard/servidor-detalhes";
import { ServidorMapa } from "@/components/dashboard/servidor-mapa";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useMetricasMock } from "@/hooks/useMetricasMock";
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
const tempAtualizadoEm = "16:15";

const cores = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

const filtrosIniciais = { regiao: TODAS_AS_REGIOES, status: [] };

const tempResumoAlertas = { amarelo: 2, vermelho: 3, total: 5 };
const tempResumoCapturas = { recebidas: 42, esperadas: 42, porticos: 6 };

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const selecionadoUrl = searchParams.get("selecionado");

  const usuario = useAuth((state) => state.usuario);
  const { empresa } = useFetchEmpresa();
  const { embarcados, isLoading } = useFetchEmbarcados();
  const metricas = useMetricasMock();

  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState(selecionadoUrl || null);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const handleBuscaChange = (e) => setBusca(e.target.value);
  const handleLimparFiltros = () => setFiltros(filtrosIniciais);

  const regioes = useMemo(() => listarRegioes(embarcados), [embarcados]);

  const filtrosAtivos =
    (filtros.regiao !== TODAS_AS_REGIOES ? 1 : 0) + filtros.status.length;

  // média do disco: soma tudo e divide pela quantidade de dias
  let somaDisco = 0;
  for (const valor of metricas.disco.usado) {
    somaDisco += valor;
  }
  const mediaDisco = (somaDisco / metricas.disco.usado.length).toFixed(1);

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
      (servidor) => String(servidor.id_embarcado) === String(selecionadoId),
    ) ?? servidoresFiltrados[0];

  const totalVerde = 1;
  const totalAmarelo = 2;
  const totalVermelho = 3;

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
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumoCard
          titulo="Situação Embarcados"
          icon={HardDrivesIcon}
          tom="warning"
          atualizadoEm={tempAtualizadoEm}
        >
          <StatusCount status="verde" quantidade={totalVerde} />
          <StatusCount status="amarelo" quantidade={totalAmarelo} />
          <StatusCount status="vermelho" quantidade={totalVermelho} />
          <ResumoTotal total={embarcados.length} />
        </ResumoCard>

        <ResumoCard
          titulo="Alertas e Notificações"
          icon={BellIcon}
          tom="destructive"
          atualizadoEm={tempAtualizadoEm}
        >
          <StatusCount
            status="amarelo"
            quantidade={tempResumoAlertas.amarelo}
          />
          <StatusCount
            status="vermelho"
            quantidade={tempResumoAlertas.vermelho}
          />
          <ResumoTotal total={tempResumoAlertas.total} />
        </ResumoCard>

        <ResumoCard
          titulo="Capturas Recebidas/Esperadas"
          icon={CameraIcon}
          atualizadoEm={tempAtualizadoEm}
        >
          {tempResumoCapturas.recebidas} / {tempResumoCapturas.esperadas}
          <span className="text-xs font-normal text-muted-foreground">
            de {tempResumoCapturas.porticos} pórticos
          </span>
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

          {isLoading ? (
            <div className="flex h-105 items-center justify-center rounded-xl bg-background ring-1 ring-foreground/10 lg:h-full lg:min-h-105">
              <Spinner />
            </div>
          ) : (
            <ServidorMapa
              servidores={servidoresFiltrados}
              selecionadoId={selecionado.id_embarcado}
              onSelecionar={setSelecionadoId}
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
    </div>
  );
}