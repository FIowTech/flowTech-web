import { GraficoDonut } from "@/components/dashboard/graficos";
import { GraficoBarras } from "@/components/dashboard/graficos";
import { InsightsPeriodo } from "@/components/dashboard/insights-periodo";
import { useFetchGoldAlertasComponentes } from "@/hooks/useFetchGoldAlertasComponentes";
import { Relogio } from "@/components/relogio";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
// import { useFetchChamadosJira } from "@/hooks/useFetchChamadosJira";
import { useFetchJiraEquipe } from "@/hooks/useFetchJiraEquipe";
import { useAuth } from "@/store/auth-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Variáveis mockadas e temporárias
const tempAtualizadoEm = "16:15";

export default function HomePage() {
  const usuario = useAuth((state) => state.usuario);
  const { empresa } = useFetchEmpresa();
  const { embarcados, isLoading } = useFetchEmbarcados();
  const embarcadosEmAlerta = embarcados.filter((embarcado) => embarcado.parametros.some((parametro) => parametro.status === 0)).length;
  // Ordenação e Filtro: Crítico (0/vermelho) -> Alerta (amarelo) -> OK (1/verde)
  const embarcadosApelido = embarcados.map(
    (embarcado) => embarcado.apelido
  );

  // Estados dos filtros
  const [open, setOpen] = useState(false);
  const [periodo, setPeriodo] = useState("atual");
  const [servidorSelecionado, setServidorSelecionado] = useState("todos");

  const servidorApelido = servidorSelecionado === "todos" ? "Todos os servidores": embarcados?.find(
        (servidor) =>
          String(servidor.id_embarcado) === String(servidorSelecionado)
  )?.apelido || servidorSelecionado;

  const {
    dados: dadosAlertas,
    componentes: componentesAlertas,
    totalAlertas,
    isLoading: carregandoAlertas,
    error: erroAlertas,
  } = useFetchGoldAlertasComponentes(
    periodo,
    servidorSelecionado,
  );

  // Servidores disponíveis
  const servidoresDisponiveis = embarcados.map((embarcado) => ({
    id: String(embarcado.id),
    nome: embarcado.nome ?? `Servidor ${embarcado.id}`,
  }));

  // const {
  //   dados: chamadosJira,
  //   totalChamados,
  //   isLoading: carregandoJira,
  //   error: erroJira,
  // } = useFetchChamadosJira();
  const {
    labels: labelsJira,
    valores: valoresJira,
    isLoading: loadingJira,
    error: errorJira,
  } = useFetchJiraEquipe();

  // // Métricas simuladas: mudam sozinhas a cada 3 segundos (ver useMetricasMock)
  // const metricas = useMetricasMock();

  // useMemo guarda o resultado e só refaz o filtro quando a busca ou os dados mudam.
  // Sem isso, o mapa se reenquadraria a cada clique em um marcador
  return (
    <div className="w-full flex flex-col space-y-6">
      {/* topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Olá, {usuario?.nome ?? "usuário"}!</p>
          <h2 className="font-heading text-xl font-semibold">{empresa?.razao_social}</h2>
        </div>

        <Relogio />
      </div>

      {/* resumo */}
      {/* <section className="grid grid-cols-1 gap-20 md:grid-cols-2">
        <ResumoCard
          titulo="Pórticos Monitorados"
          icon={HardDrivesIcon}
          tom="neutro"
          atualizadoEm={tempAtualizadoEm}
        >
          <span className="text-4xl font-bold ml-10">
            {embarcados.length} 
          </span>
          <span className="text-3xl font-normal">pórticos</span>
        </ResumoCard>

        <ResumoCard
          titulo="Pórticos em Alerta"
          icon={BellIcon}
          tom="destructive"
          atualizadoEm={tempAtualizadoEm}
        >
          <span className="text-4xl ml-10">{embarcadosEmAlerta}</span>
          <span className="text-3xl font-normal">pórticos</span>
        </ResumoCard>
      </section> */}
        <div className="flex flex-row gap-6">
          <div className="h-98 bg-background border border-border p-4 rounded-2xl w-170">
            <div className="flex justify-between ml-5">
              <span className="font-medium">Quantidade de Alertas por Componente</span>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        type="button"
                        className="cursor-pointer"
                      >
                        Filtros
                      </Button>
                    }
                  />

                  <DialogContent>
                    <DialogHeader>
                      <h1 className="font-bold text-2xl">Filtros da Dashboard</h1>
                      <h3 className="font-normal">Servidor</h3>

                      <Select
                        value={servidorApelido}
                        onValueChange={setServidorSelecionado}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um servidor" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="todos">
                            Todos os Servidores
                          </SelectItem>

                          {embarcados.map((embarcado) => (
                            <SelectItem
                              key={embarcado.id_embarcado}
                              value={String(embarcado.id_embarcado)}
                            >
                              {embarcado.apelido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DialogHeader>
                        
                    <div className="space-y-5">
                        
                      {/* Filtro de período */}
                      <div className="space-y-3">
                        <h3 className="font-normal">Período</h3>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Atual", value: "atual" },
                            { label: "Últimos 7 dias", value: "7d" },
                            { label: "Últimos 15 dias", value: "15d" },
                            { label: "Últimos 30 dias", value: "30d" },
                          ].map((item) => (
                            <Button
                              key={item.value}
                              type="button"
                              variant={periodo === item.value ? "default" : "outline"}
                              onClick={() => setPeriodo(item.value)}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                        
                    </div>
                        
                    {/* Ações */}
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setServidorSelecionado("todos");
                          setPeriodo("atual");
                        }}
                      >
                        Limpar filtros
                      </Button>
                      
                      <Button onClick={() => setOpen(false)}>
                        Aplicar filtros
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
              <div className="grid grid-cols-1 ml-5">
                <span className="text-muted-foreground text-sm">Servidor: {servidorApelido}</span>
                <span className="text-muted-foreground text-sm">Período: {periodo}</span>
              </div>
            <div className="mt-10 ml-8">
                <GraficoDonut
                  labels={componentesAlertas.map(
                    (componente) => componente.nome.toUpperCase(),
                  )}
                  linhas={[
                    {
                      valores: componentesAlertas.map(
                        (componente) => componente.total,
                      ),
                      cores: [
                        "#ef4444",
                        "#f59e0b",
                        "#3b82f6",
                        "#8b5cf6",
                      ],
                    },
                  ]}
                />
            </div>
          </div>
          <div className="w-100 shrink-0">
            <InsightsPeriodo
              totalAlertas={totalAlertas}
              periodo={periodo}
              variacaoPercentual={null}
              servidoresSemAlertas={null}
              totalServidores={null}
            />
          </div>

        </div>
        <div className="flex flex-row gap-6">
          <div className="h-93 bg-background border border-border p-4 rounded-2xl mt-3 w-full">
              <div className="flex justify-between items-center">
                <span>Chamados da Equipe</span>
                        
                {/* <span className="text-sm text-muted-foreground">
                  Total: {totalChamados}
                </span> */}
              </div>
              <div className="h-70 w-full">
                <GraficoBarras
                  // labels={chamadosJira.map((chamado) => chamado.nome)}
                  // valores={chamadosJira.map((chamado) => chamado.total)}
                  // cores={["#22c55e", "#f59e0b", "#3b82f6"]}
                    labels={labelsJira}
                    valores={valoresJira}
                    cores={labelsJira.map(
                      (_, index) =>
                        [
                          "#22c55e",
                          "#f59e0b",
                          "#3b82f6",
                          "#8b5cf6",
                          "#ef4444",
                          "#06b6d4",
                        ][index % 6]
                    )}
                />
              </div>
          </div>
          <div className="w-100 shrink-0">
            <InsightsPeriodo
              totalAlertas={totalAlertas}
              periodo={periodo}
              variacaoPercentual={null}
              servidoresSemAlertas={null}
              totalServidores={null}
            />
          </div>
        </div>
    </div>
  );
}
