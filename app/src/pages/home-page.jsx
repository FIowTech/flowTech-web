import { GraficoDonut } from "@/components/dashboard/graficos";
import { GraficoBarras } from "@/components/dashboard/graficos";
import { ResumoCard } from "@/components/dashboard/resumo-card";
import { Relogio } from "@/components/relogio";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { useMetricasMock } from "@/hooks/useMetricasMock";
import { useAuth } from "@/store/auth-store";
import { BellIcon, HardDrivesIcon } from "@phosphor-icons/react";
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
  // const [servidoresSelecionados, setServidoresSelecionados] = useState([]);
  const [periodo, setPeriodo] = useState("atual");
  const [servidorSelecionado, setServidorSelecionado] = useState("Todos os Servidores");

  // Servidores disponíveis
  const servidoresDisponiveis = embarcados.map((embarcado) => ({
    id: String(embarcado.id),
    nome: embarcado.nome ?? `Servidor ${embarcado.id}`,
  }));

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
      <section className="grid grid-cols-1 gap-20 md:grid-cols-2">
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
      </section>
      <div className="grid grid-cols-1 gap-75 md:grid-cols-2 ">
        <div className="h-100 bg-background border border-border p-4 rounded-2xl w-170">
          <div className="flex justify-between mr-5 ml-5">
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
                      value={servidorSelecionado}
                      onValueChange={setServidorSelecionado}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um servidor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos os Servidores">
                          Todos os Servidores
                        </SelectItem>
                                  
                        {embarcados.map((embarcado) => (
                          <SelectItem
                            key={embarcado.id_embarcado}
                            value={String(embarcado.apelido)}
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
                        setServidorSelecionado("Todos os servidores");
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
              <span className="text-muted-foreground text-sm">Servidor: {servidorSelecionado}</span>
              <span className="text-muted-foreground text-sm">Período: {periodo}</span>
            </div>
          <div className="h-60 mt-10 mr-70">
              <GraficoDonut
                labels={["CPU", "RAM", "Disco","Rede"]}
                linhas={[
                  {
                    valores: [5, 4, 3,1],
                    cores: ["#EF4444", "#F59E0B", "#3B82F6","#5D45EA"],
                  }
                ]}
              />
            </div>
        </div>
        <div className="h-100 bg-background border border-border p-4 rounded-2xl w-100">
          <span>Chamados da Equipe</span>
          <div className="h-80">
            <GraficoBarras
              labels={["Márcio", "Kevin", "Agatha"]}
              valores={[35, 52, 28]}
              cores={["#22c55e", "#f59e0b", "#3b82f6"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
