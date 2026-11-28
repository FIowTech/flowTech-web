import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const pluginLinhasLimite = {
  id: "pluginLinhasLimite",
  afterDatasetsDraw(chart, _args, options) {
    const { ctx, chartArea, scales } = chart;
    const eixoY = scales.y;
    if (!chartArea || !eixoY) return;

    const limites = [
      { valor: options.limiteMax, label: "Limite máximo", cor: "#ef4444" },
      { valor: options.limiteMin, label: "Limite mínimo", cor: "#3b82f6" },
    ].filter(
      ({ valor }) =>
        valor !== null && valor !== "" && Number.isFinite(Number(valor)),
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top,
    );
    ctx.clip();

    for (const { valor, label, cor } of limites) {
      const y = eixoY.getPixelForValue(Number(valor));
      if (y < chartArea.top || y > chartArea.bottom) continue;

      ctx.strokeStyle = cor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();

      ctx.fillStyle = cor;
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${label}: ${valor}`, chartArea.left + 4, y - 2);
    }

    ctx.restore();
  },
};

// gráfico de linha.
// - labels: nomes do eixo X (ex.: horários)
// - linhas: lista de linhas, cada uma assim: { nome: "Download", valores: [1, 2, 3], cor: "#36c876" }
// - unidade: texto que aparece no eixo Y (ex.: "%")
// - max: valor máximo do eixo Y (opcional)
// - area: true pinta o espaço embaixo da linha
export function GraficoLinha({ labels, linhas, unidade, max, area, limiteMax = null, limiteMin = null }) {
  const datasets = linhas.map((linha) => ({
    label: linha.nome,
    data: linha.valores,
    borderColor: linha.cor,
    backgroundColor: linha.cor + "99", 
    fill: area,
    tension: 0.4, 
    spanGaps: linha.spanGaps ?? false,
    pointRadius: 3,        
    pointHoverRadius: 5, 
  }));

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: linhas.length > 1 }, 
      pluginLinhasLimite: {
        limiteMax: limiteMax,
        limiteMin: limiteMin,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: max,
        ticks: { callback: (valor) => valor + " " + unidade },
      },
    },
  };

  return <Line data={{ labels, datasets }} options={opcoes} plugins={[pluginLinhasLimite]} />;
}