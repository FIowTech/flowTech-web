import { GraficoDonut } from "@/components/dashboard/graficos";
import {
  ResumoCard,
  ResumoTotal,
  StatusCount,
} from "@/components/dashboard/resumo-card";
import { Relogio } from "@/components/relogio";
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

export default function HomePage() {
  const usuario = useAuth((state) => state.usuario);
  const { empresa } = useFetchEmpresa();
  const { embarcados, isLoading } = useFetchEmbarcados();
  const embarcadosEmAlerta = embarcados.filter((embarcado) => embarcado.parametros.some((parametro) => parametro.status === 0)).length;
  // Ordenação e Filtro: Crítico (0/vermelho) -> Alerta (amarelo) -> OK (1/verde)

  // Métricas simuladas: mudam sozinhas a cada 3 segundos (ver useMetricasMock)
  const metricas = useMetricasMock();

  // useMemo guarda o resultado e só refaz o filtro quando a busca ou os dados mudam.
  // Sem isso, o mapa se reenquadraria a cada clique em um marcador
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
      <div className="h-100 bg-background border border-border p-4 rounded-2xl w-full">
          <span className="text-4xl">
            Quantidade de Alertas por Componente
          </span>
          <GraficoDonut
            labels={["CPU", "RAM", "Disco","Rede"]}
            linhas={[
              {
                nome: "Alertas",
                valores: [5, 4, 3,1],
                cores: ["#EF4444", "#F59E0B", "#3B82F6","#5D45EA"],
              },
            ]}
          />
      </div>
    </div>
  );
}
