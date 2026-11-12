import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  ArcElement,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
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
    label: linha.nome,
    data: linha.valores,
    backgroundColor: linha.cores,
    borderWidth: 0,
  }));

  const opcoes = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: linhas.length > 0,
        position: "right",
      },
    },
  };

  return <Doughnut data={{ labels, datasets }} options={opcoes}/>;
}