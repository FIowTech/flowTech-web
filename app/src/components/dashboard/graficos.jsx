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