import { MetricaCard } from "@/components/embarcados/detalhes/metrica-card";
import { NetworkCard } from "@/components/embarcados/detalhes/network-card";
import { Relogio } from "@/components/relogio";
import { METRICAS_MOCK } from "@/constants/mocks";
import { useFetchEmbarcado } from "@/hooks/useFetchEmbarcado";
import { useParams } from "react-router";

export default function EmbarcadosDetailsPage() {
  const { id } = useParams();
  const { embarcado, isLoading, error } = useFetchEmbarcado(id);

  const embarcadoApelido = embarcado ? embarcado.apelido : "Embarcado";

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Embarcado – Detalhes</p>
          <h2 className="text-xl font-bold">{embarcadoApelido}</h2>
        </div>

        <Relogio />
      </div>

      {/* Seção - Métricas */}
      <div className="flex flex-col space-y-4">
        <p className="text-text-primary">
          Informações Gerais sobre {embarcadoApelido}
        </p>
        <div className="w-full flex items-center space-x-4">
          <MetricaCard title={"Uso de CPU"} metrica={METRICAS_MOCK.cpu} variation="circle" />
          <MetricaCard title={"Uso de RAM"} metrica={METRICAS_MOCK.ram} />
          <MetricaCard title={"Armazenamento"} metrica={METRICAS_MOCK.disco} />
          <NetworkCard title={"Tráfego de Rede"} network={METRICAS_MOCK.rede} />
        </div>
      </div>

      {/* Seção - Logs */}
      <div></div>

      {/* Seção - Traces */}
      <div></div>
    </div>
  );
}
