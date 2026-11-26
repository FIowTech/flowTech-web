import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  ArcElement,
  Legend,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  annotationPlugin
);

// gráfico de linha.
// - labels: nomes do eixo X (ex.: horários)
// - linhas: lista de linhas, cada uma assim: { nome: "Download", valores: [1, 2, 3], cor: "#36c876" }
// - unidade: texto que aparece no eixo Y (ex.: "%")
// - max: valor máximo do eixo Y (opcional)
// - area: true pinta o espaço embaixo da linha
export function GraficoLinha({ labels, linhas, unidade, max, area }) {
  const datasets = linhas.map((linha) => ({
    label: linha.nome,
    data: linha.valores,
    borderColor: linha.cor,
    backgroundColor: linha.cor + "99", 
    fill: area,
    tension: 0.4, 
    pointRadius: 0, 
  }));

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: linhas.length > 1 }, 
    },
    scales: {
      y: {
        beginAtZero: true,
        max: max,
        ticks: { callback: (valor) => valor + " " + unidade },
      },
    },
  };

  return <Line data={{ labels, datasets }} options={opcoes} />;
}

export function GraficoDonut({ labels, linhas }) {
  // ==========================================
  // 1. CONFIGURAÇÃO DOS DADOS DO GRÁFICO
  // ==========================================

  const datasets = linhas.map((linha) => ({
    label: linha.label || "Alertas",
    data: linha.valores,
    backgroundColor: linha.cores,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 5,
    spacing: 2,
    hoverOffset: 5,
  }));

  // ==========================================
  // 2. CALCULAR QUANTIDADES E PORCENTAGENS
  // ==========================================

  const totalGeral = linhas.reduce(
    (soma, linha) =>
      soma + linha.valores.reduce((total, valor) => total + valor, 0),
    0
  );

  const dadosLegenda = labels.map((label, index) => {
    const total = linhas.reduce(
      (soma, linha) => soma + (linha.valores[index] || 0),
      0
    );

    const percentual =
      totalGeral > 0 ? (total / totalGeral) * 100 : 0;

    return {
      nome: label,
      total: total,
      percentual: percentual,
      cor: linhas[0]?.cores[index],
    };
  });

  // ==========================================
  // 3. CONFIGURAÇÕES DO CHART.JS
  // ==========================================

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",

    plugins: {
      // Desativamos a legenda padrão
      legend: {
        display: false,
      },

      // Configuração do tooltip
      tooltip: {
        callbacks: {
          label: (context) => {
            const valor = context.raw;

            const total = context.dataset.data.reduce(
              (soma, item) => soma + item,
              0
            );

            const percentual =
              total > 0
                ? ((valor / total) * 100).toFixed(1)
                : "0.0";

            return `${context.label}: ${valor} (${percentual}%)`;
          },
        },
      },
    },
  };

  // ==========================================
  // 4. EXIBIÇÃO DO GRÁFICO E LEGENDA
  // ==========================================

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full h-full">

      {/* GRÁFICO DE ROSCA */}
      <div className="w-48 h-48 shrink-0">
        <Doughnut
          data={{
            labels: labels,
            datasets: datasets,
          }}
          options={opcoes}
        />
      </div>

      {/* LEGENDA PERSONALIZADA */}
      <div className="flex flex-col gap-1 w-full flex-1 min-w-0">

        {dadosLegenda.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
          >

            {/* BOLINHA COLORIDA E NOME */}
            <div className="flex items-center gap-3 min-w-0">

              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor: item.cor,
                }}
              />

              <span className="text-sm font-medium truncate">
                {item.nome}
              </span>

            </div>

            {/* QUANTIDADE E PERCENTUAL */}
            <div className="flex items-center gap-4 shrink-0">

              <span className="text-sm font-semibold min-w-8 text-right">
                {item.total}
              </span>

              <span className="text-sm text-muted-foreground min-w-12 text-right">
                {item.percentual.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export function GraficoBarras({ labels, valores, cores }) {
  const datasets = {
    labels,
    datasets: [
      {
        label: "Quantidade de chamados",
        data: valores,
        backgroundColor: cores,
        borderRadius: 5,
        borderWidth: 1,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      annotation: {
          annotations: {
            linhaMeta: {
              type: 'line',
              // Linha horizontal no valor 15 do eixo Y
              yMin: 15,
              yMax: 15,

              borderColor: 'red',
              borderWidth: 2,
              borderDash: [8, 5]
            }
          }
        }
    },
    scales: {
      y: {
        beginAtZero: true,
        // ticks: {
        //   precision: 0,
        // },
      },
    },
  };

  return <Bar data={datasets} options={opcoes} />;
}

export function GraficoBarrasHorizontais({
  labels,
  valores,
  nomeSerie = "Total",
  cor = "rgba(161, 161, 170, 0.35)",
  itemSelecionado,
  onBarClick,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const backgroundColors = labels.map((label) =>
    itemSelecionado && label === itemSelecionado
      ? isLight
        ? "rgba(24, 24, 27, 0.85)"
        : "rgba(244, 244, 245, 0.75)"
      : cor
  );

  const data = {
    labels,
    datasets: [
      {
        label: nomeSerie,
        data: valores,
        backgroundColor: backgroundColors,
        borderColor: isLight ? "rgba(113, 113, 122, 0.5)" : "rgba(161, 161, 170, 0.6)",
        borderWidth: 1,
        borderRadius: { topRight: 4, bottomRight: 4 },
        barThickness: 18,
      },
    ],
  };

  const opcoes = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (elements.length > 0 && onBarClick) {
        const index = elements[0].index;
        onBarClick(labels[index]);
      }
    },
    onHover: (event, elements) => {
      if (event.native?.target) {
        event.native.target.style.cursor =
          elements.length > 0 && onBarClick ? "pointer" : "default";
      }
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        border: { display: false },
        grid: {
          color: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
          tickBorderDash: [4, 4],
        },
        ticks: {
          color: isLight ? "#52525b" : "#a1a1aa",
          font: { size: 12 },
        },
      },
      y: {
        border: {
          color: isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
        },
        grid: { display: false },
        ticks: {
          color: isLight ? "#18181b" : "#f4f4f5",
          font: { size: 12, weight: 500 },
        },
      },
    },
  };

  return <Bar data={data} options={opcoes} />;
}

export function GraficoBarrasEmpilhadas({ labels, series }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const datasets = series.map((serie, index) => ({
    label: serie.nome,
    data: serie.valores,
    backgroundColor: serie.cor,
    barThickness: 28,
    borderRadius: index === series.length - 1 ? { topLeft: 4, topRight: 4 } : 0,
  }));

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        border: {
          color: isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
        },
        grid: { display: false },
        ticks: {
          color: isLight ? "#52525b" : "#a1a1aa",
          font: { size: 12 },
        },
      },
      y: {
        stacked: true,
        border: { display: false },
        grid: {
          color: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
          tickBorderDash: [4, 4],
        },
        ticks: {
          color: isLight ? "#52525b" : "#a1a1aa",
          font: { size: 12 },
        },
      },
    },
  };

  return <Bar data={{ labels, datasets }} options={opcoes} />;
}

export function GraficoBarrasHorizontaisJira({
  labels = [],
  valores = [],
  nomeSerie = "Chamados em aberto",
  itemSelecionado,
  onBarClick,
  limiteChamados = 8,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  function gerarCorPorNome(nome) {
  let hash = 0;

  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsla(${hue}, 70%, 55%, 0.8)`;
}

  // 1. ORGANIZAÇÃO DOS DADOS
  const dadosOrdenados = labels
    .map((label, index) => ({
      label,
      valor: Number(valores[index]) || 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  const labelsOrdenados = dadosOrdenados.map(
    (item) => item.label
  );

  const valoresOrdenados = dadosOrdenados.map(
    (item) => item.valor
  );

  // 2. CONFIGURAÇÃO DAS CORES
  const backgroundColors = labelsOrdenados.map((label) => {
  if (label.toLowerCase().includes("não atribuído")) {
    return "rgba(245, 158, 11, 0.85)";
  }

  if (itemSelecionado === label) {
    return isLight
      ? "rgba(24, 24, 27, 0.85)"
      : "rgba(244, 244, 245, 0.75)";
  }

  return gerarCorPorNome(label);
});

  // 3. CONFIGURAÇÃO DOS DADOS DO GRÁFICO
  const data = {
    labels: labelsOrdenados,
    datasets: [
      {
        label: nomeSerie,
        data: valoresOrdenados,
        backgroundColor: backgroundColors,
        borderColor: isLight
          ? "rgba(113, 113, 122, 0.5)"
          : "rgba(161, 161, 170, 0.6)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 20,
        maxBarThickness: 26,
      },
    ],
  };

  // 4. CONFIGURAÇÕES DO CHART.JS
  const opcoes = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    onClick: (_, elements) => {
      if (elements.length > 0 && onBarClick) {
        const index = elements[0].index;
        onBarClick(labelsOrdenados[index]);
      }
    },

    onHover: (event, elements) => {
      if (event.native?.target) {
        event.native.target.style.cursor =
          elements.length > 0 && onBarClick
            ? "pointer"
            : "default";
      }
    },

    plugins: {
      legend: {
        display: false,
      },
    
      tooltip: {
        padding: 12,
        callbacks: {
          label: (context) =>
            `${context.parsed.x} chamados`,
        },
      },
    
      annotation: {
        annotations: {
          limite: {
            type: "line",
            xMin: limiteChamados,
            xMax: limiteChamados,
            borderColor: "red",
            borderWidth: 2,
            borderDash: [6, 5],
            label: {
              display: true,
              content: `Limite: ${limiteChamados}`,
              position: "start",
              backgroundColor: "red",
              color: "#ffffff",
              font: {
                size: 11,
                weight: "bold",
              },
              padding: 5,
            },
          },
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: isLight
            ? "rgba(0, 0, 0, 0.08)"
            : "rgba(255, 255, 255, 0.08)",
          tickBorderDash: [4, 4],
        },
        ticks: {
          color: isLight ? "#52525b" : "#a1a1aa",
          font: {
            size: 12,
          },
          precision: 0,
          stepSize: 1,
        },
      },

      y: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: isLight ? "#18181b" : "#f4f4f5",
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
    },
  };

  return (<Bar data={data} options={opcoes} />);
}