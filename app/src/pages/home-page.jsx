import {
  ResumoCard, ResumoTotal, StatusCount } from "@/components/dashboard/resumo-card";
import { GraficoLinha } from "@/components/dashboard/graficos";
import { MetricaPainel } from "@/components/dashboard/metrica-painel";
import { ServidorBusca } from "@/components/dashboard/servidor-busca";
import { ServidorDetalhes } from "@/components/dashboard/servidor-detalhes";
import { ServidorMapa } from "@/components/dashboard/servidor-mapa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Relogio } from "@/components/relogio";
import { Spinner } from "@/components/ui/spinner";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useMetricasMock } from "@/hooks/useMetricasMock";
import { useAuth } from "@/store/auth-store";
import { BellIcon, CameraIcon, HardDrivesIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

// Variáveis mockadas e temporárias
const tempAtualizadoEm = "16:15";

const cores = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

const tempResumoAlertas = { amarelo: 3, vermelho: 2, total: 24 };
const tempResumoCapturas = { recebidas: 100, esperadas: 100, porticos: 5 };

export default function HomePage() {
  const usuario = useAuth((state) => state.usuario);
  const { empresa } = useFetchEmpresa();
  const { embarcados, isLoading } = useFetchEmbarcados();
  // Métricas simuladas: mudam sozinhas a cada 3 segundos (ver useMetricasMock)
  const metricas = useMetricasMock();

  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState(null);

  const handleBuscaChange = (e) => setBusca(e.target.value);

  // média do disco: soma tudo e divide pela quantidade de dias
  let somaDisco = 0;
  for (const valor of metricas.disco.usado) {
    somaDisco += valor;
  }
  const mediaDisco = (somaDisco / metricas.disco.usado.length).toFixed(1);

  // useMemo guarda o resultado e só refaz o filtro quando a busca ou os dados mudam.
  // Sem isso, o mapa se reenquadraria a cada clique em um marcador.
  const servidoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return embarcados.filter((servidor) => {
      const endereco = servidor.endereco ?? {};
      const texto = [servidor.apelido, servidor.modelo, endereco.localidade].join(" ");

      return texto.toLowerCase().includes(termo);
    });
  }, [busca, embarcados]);

  // O servidor clicado; se ninguém clicou ainda, usa o primeiro da lista
  const selecionado =
    embarcados.find((servidor) => servidor.id_embarcado === selecionadoId) ??
    embarcados[0];

  // Contagem real. No banco o status é 1 (controlado) ou 0 (crítico).
  const totalVerde = embarcados.filter((servidor) => servidor.status === 1).length;
  const totalVermelho = embarcados.length - totalVerde;

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
          <StatusCount status="amarelo" quantidade={0} />
          <StatusCount status="vermelho" quantidade={totalVermelho} />
          <ResumoTotal total={embarcados.length} />
        </ResumoCard>

        <ResumoCard
          titulo="Alertas e Notificações"
          icon={BellIcon}
          tom="destructive"
          atualizadoEm={tempAtualizadoEm}
        >
          <StatusCount status="amarelo" quantidade={tempResumoAlertas.amarelo} />
          <StatusCount status="vermelho" quantidade={tempResumoAlertas.vermelho} />
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
          <ServidorBusca value={busca} onChange={handleBuscaChange} />

          {isLoading ? (
            <div className="flex h-105 items-center justify-center rounded-xl bg-background ring-1 ring-foreground/10 lg:h-full lg:min-h-105">
              <Spinner />
            </div>
          ) : (
            <ServidorMapa
              servidores={servidoresFiltrados}
              selecionadoId={selecionado?.id_embarcado}
              onSelecionar={setSelecionadoId}
            />
          )}
        </div>

        <ServidorDetalhes servidor={selecionado} />
      </section>

      {/* métricas do servidor selecionado */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Métricas de {selecionado?.apelido ?? "—"}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-2">
          <MetricaPainel titulo="Métricas CPU" valor={metricas.cpu.atual}>
            <GraficoLinha
              labels={metricas.horarios}
              linhas={[
                { nome: "Uso de CPU", valores: metricas.cpu.valores, cor: cores.verde },
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
                { nome: "Uso de RAM", valores: metricas.ram.valores, cor: cores.amarelo },
              ]}
              unidade="GiB"
              area
            />
          </MetricaPainel>

          <MetricaPainel titulo="Métricas Rede" valor={metricas.rede.atual}>
            <GraficoLinha
              labels={metricas.horarios}
              linhas={[
                { nome: "Download", valores: metricas.rede.download, cor: cores.verde },
                { nome: "Upload", valores: metricas.rede.upload, cor: cores.cinza },
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
                { nome: "Disco usado", valores: metricas.disco.usado, cor: cores.verde },
              ]}
              unidade="GB"
              max={metricas.disco.capacidade}
              area
            />
          </MetricaPainel>
        </CardContent>
      </Card>
    </div>
  );
}
