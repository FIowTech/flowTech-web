import { useEffect, useState } from "react";
import { ResumoCards } from "@/components/dashboard/financeiro/resumo-card";
import { GraficoRankingPorticos } from "@/components/dashboard/financeiro/grafico-ranking";
import { GraficoComponentesHardware } from "@/components/dashboard/financeiro/grafico-componentes";
import { GraficoEvolucaoExposicao } from "@/components/dashboard/financeiro/grafico-evolucao";
import { useFetchGoldExposicao } from "@/hooks/useFetchGoldExposicao";

const HARDWARE_VAZIO = {
  specs: {
    host: "-",
    cpu: "-",
    ram: "-",
    disco: "-",
  },
  componentes: [],
};

export default function DashboardFinanceiro() {
  const [periodoGeral, setPeriodoGeral] = useState("mes-atual");
  const [porticoSelecionado, setPorticoSelecionado] = useState("");

  const {
    resumo,
    ranking,
    hardwarePorPortico,
    evolucaoPorPortico,
    isLoading,
    error,
  } = useFetchGoldExposicao(periodoGeral);

  // Mantém o pórtico selecionado sincronizado quando o ranking atualiza
  useEffect(() => {
    if (ranking.length === 0) {
      setPorticoSelecionado("");
      return;
    }

    const existeNoRanking = ranking.some(
      (item) => item.portico === porticoSelecionado
    );

    if (!existeNoRanking) {
      setPorticoSelecionado(ranking[0].portico);
    }
  }, [ranking, porticoSelecionado]);

  const dadosHardwareAtual =
    (porticoSelecionado && hardwarePorPortico[porticoSelecionado]) ||
    HARDWARE_VAZIO;

  const dadosEvolucaoAtual =
    (porticoSelecionado && evolucaoPorPortico[porticoSelecionado]) || [];

  return (
    <div className="w-full min-h-dvh flex flex-col gap-4 bg-background-dark">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Exposição de Veículos nos Pórticos
          </h2>
          <p className="text-muted-foreground">
            Tráfego exposto durante irregularidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Período
          </span>
          <select
            value={periodoGeral}
            onChange={(e) => setPeriodoGeral(e.target.value)}
            disabled={isLoading}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground disabled:opacity-50"
          >
            <option value="mes-atual">Mês atual</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/50 bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div
        className={`flex flex-col gap-4 transition-opacity duration-200 ${
          isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* 1. TOPO: KPIs */}
        <ResumoCards resumo={resumo} />

        {/* 2. MEIO: RANKING À ESQUERDA + HARDWARE À DIREITA */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7">
            <GraficoRankingPorticos
              dados={ranking}
              porticoSelecionado={porticoSelecionado}
              onSelectPortico={setPorticoSelecionado}
            />
          </div>

          <div className="lg:col-span-5">
            <GraficoComponentesHardware
              porticos={ranking.map((item) => item.portico)}
              porticoSelecionado={porticoSelecionado}
              onSelectPortico={setPorticoSelecionado}
              dadosPortico={dadosHardwareAtual}
            />
          </div>
        </section>

        {/* 3. BASE: EVOLUÇÃO TEMPORAL DO PÓRTICO SELECIONADO */}
        <GraficoEvolucaoExposicao
          porticoSelecionado={porticoSelecionado}
          dadosEvolucao={dadosEvolucaoAtual}
        />
      </div>
    </div>
  );
}