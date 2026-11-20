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
  const datasets = linhas.map((linha) => ({
    label: "Alertas",
    data: linha.valores,
    backgroundColor: linha.cores,
    borderWidth: 1,
    borderRadius: 5,
  }));

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "right",
                labels: {
          color: "#9ca3af",
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
  };

  return <Doughnut data={{ labels, datasets }} options={opcoes}/>;
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
        borderWidth: 0,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
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