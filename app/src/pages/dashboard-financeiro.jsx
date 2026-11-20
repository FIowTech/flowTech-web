import { useState } from "react";
import { ResumoCards } from "@/components/dashboard/financeiro/resumo-card";
import { GraficoRankingPorticos } from "@/components/dashboard/financeiro/grafico-ranking";
import { GraficoComponentesHardware } from "@/components/dashboard/financeiro/grafico-componentes";
import { GraficoEvolucaoExposicao } from "@/components/dashboard/financeiro/grafico-evolucao";

const MOCK_RESUMO = {
  total: "52.000",
  comerciais: "8.900",
  passeios: "3.000",
  motos: "1.200",
  maiorPortico: "PADR-SR099",
  cobertura: "97%",
};

const MOCK_RANKING = [
  { portico: "PADR-SR099", veiculos: 18400 },
  { portico: "PADR-SR042", veiculos: 14200 },
  { portico: "PADR-SR018", veiculos: 9800 },
  { portico: "PADR-SR105", veiculos: 5400 },
  { portico: "PADR-SR007", veiculos: 4200 },
];

const MOCK_HARDWARE_POR_PORTICO = {
  "PADR-SR099": {
    specs: {
      host: "SRV-099",
      cpu: "3.2ghz",
      ram: "128 GB",
      disco: "12 TB",
    },
    componentes: [
      {
        componente: "Memória RAM",
        veiculos: 8280,
        detalhes: { comerciais: 5100, passeios: 2680, motos: 500 },
        tempoAlerta: "4h 15min acumulados no período",
        frequencia: "18 ocorrências (média de 14 min por pico)",
        severidade: "Degradação / Lentidão (15x) vs. Indisponibilidade / Queda (3x)",
      },
      {
        componente: "CPU",
        veiculos: 4960,
        detalhes: { comerciais: 2900, passeios: 1710, motos: 350 },
        tempoAlerta: "2h 10min acumulados no período",
        frequencia: "11 ocorrências (média de 12 min por pico)",
        severidade: "Degradação / Lentidão (10x) vs. Indisponibilidade / Queda (1x)",
      },
      {
        componente: "Rede",
        veiculos: 3120,
        detalhes: { comerciais: 1800, passeios: 1120, motos: 200 },
        tempoAlerta: "1h 25min acumulados no período",
        frequencia: "6 ocorrências (média de 14 min por pico)",
        severidade: "Degradação / Lentidão (4x) vs. Indisponibilidade / Queda (2x)",
      },
      {
        componente: "Disco",
        veiculos: 1490,
        detalhes: { comerciais: 890, passeios: 500, motos: 100 },
        tempoAlerta: "45min acumulados no período",
        frequencia: "3 ocorrências (média de 15 min por pico)",
        severidade: "Degradação / Lentidão (3x) vs. Indisponibilidade / Queda (0x)",
      },
    ],
  },
  "PADR-SR042": {
    specs: {
      host: "SRV-042",
      cpu: "3.0ghz",
      ram: "64 GB",
      disco: "8 TB",
    },
    componentes: [
      {
        componente: "RAM",
        veiculos: 6400,
        detalhes: { comerciais: 3900, passeios: 2100, motos: 400 },
        tempoAlerta: "3h 40min acumulados no período",
        frequencia: "14 ocorrências (média de 15 min por pico)",
        severidade: "Degradação / Lentidão (12x) vs. Indisponibilidade / Queda (2x)",
      },
      {
        componente: "Rede",
        veiculos: 3850,
        detalhes: { comerciais: 2200, passeios: 1400, motos: 250 },
        tempoAlerta: "1h 50min acumulados no período",
        frequencia: "8 ocorrências (média de 14 min por pico)",
        severidade: "Degradação / Lentidão (5x) vs. Indisponibilidade / Queda (3x)",
      },
      {
        componente: "CPU",
        veiculos: 2450,
        detalhes: { comerciais: 1400, passeios: 900, motos: 150 },
        tempoAlerta: "1h 05min acumulados no período",
        frequencia: "7 ocorrências (média de 9 min por pico)",
        severidade: "Degradação / Lentidão (7x) vs. Indisponibilidade / Queda (0x)",
      },
      {
        componente: "Disco",
        veiculos: 1100,
        detalhes: { comerciais: 650, passeios: 380, motos: 70 },
        tempoAlerta: "30min acumulados no período",
        frequencia: "2 ocorrências (média de 15 min por pico)",
        severidade: "Degradação / Lentidão (2x) vs. Indisponibilidade / Queda (0x)",
      },
    ],
  },
};

const MOCK_EVOLUCAO_POR_PORTICO = {
  "PADR-SR099": [
    { data: "01/11", total: 1450, comerciais: 820 },
    { data: "05/11", total: 1890, comerciais: 1050 },
    { data: "10/11", total: 2150, comerciais: 1240 },
    { data: "15/11", total: 2680, comerciais: 1520 },
    { data: "20/11", total: 3120, comerciais: 1810 },
    { data: "25/11", total: 3410, comerciais: 1980 },
    { data: "30/11", total: 3700, comerciais: 2150 },
  ],
  "PADR-SR042": [
    { data: "01/11", total: 1100, comerciais: 600 },
    { data: "05/11", total: 1320, comerciais: 740 },
    { data: "10/11", total: 4200, comerciais: 2510 }, // pico isolado (ex.: feriado/queda de link)
    { data: "15/11", total: 1580, comerciais: 890 },
    { data: "20/11", total: 1850, comerciais: 1020 },
    { data: "25/11", total: 2010, comerciais: 1150 },
    { data: "30/11", total: 2140, comerciais: 1210 },
  ],
};

export default function DashboardFinanceiro() {
  const [periodoGeral, setPeriodoGeral] = useState("mes-atual");
  const [porticoSelecionado, setPorticoSelecionado] = useState("PADR-SR099");

  const dadosHardwareAtual =
    MOCK_HARDWARE_POR_PORTICO[porticoSelecionado] ||
    MOCK_HARDWARE_POR_PORTICO["PADR-SR099"];

  const dadosEvolucaoAtual =
    MOCK_EVOLUCAO_POR_PORTICO[porticoSelecionado] ||
    MOCK_EVOLUCAO_POR_PORTICO["PADR-SR099"];

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
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
          >
            <option value="mes-atual">Mês atual</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* 1. TOPO: KPIs */}
      <ResumoCards resumo={MOCK_RESUMO} />

      {/* 2. MEIO: RANKING À ESQUERDA + HARDWARE À DIREITA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <GraficoRankingPorticos
            dados={MOCK_RANKING}
            porticoSelecionado={porticoSelecionado}
            onSelectPortico={setPorticoSelecionado}
          />
        </div>

        <div className="lg:col-span-5">
          <GraficoComponentesHardware
            porticos={MOCK_RANKING.map((item) => item.portico)}
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
  );
}