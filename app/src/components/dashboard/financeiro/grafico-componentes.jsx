import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

const formatarNumero = (valor) => valor.toLocaleString("pt-BR");

const CORES_GARGALOS = [
  "#636363", // 1º maior impacto (vermelho)
  "#636363", // 2º (amarelo)
  "#636363", // 3º (azul)
  "#636363", // 4º (roxo)
  "#636363", // 5º (cinza)
];

export function GraficoComponentesHardware({
  porticos,
  porticoSelecionado,
  onSelectPortico,
  dadosPortico,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const componentesOrdenados = useMemo(() => {
    return [...(dadosPortico?.componentes || [])].sort(
      (a, b) => b.veiculos - a.veiculos
    );
  }, [dadosPortico]);

  const totalExposto = useMemo(() => {
    return componentesOrdenados.reduce((acc, item) => acc + item.veiculos, 0);
  }, [componentesOrdenados]);

  // Plugin para desenhar o total no centro da rosca
  const textoCentralPlugin = useMemo(
    () => ({
      id: "textoCentralDonut",
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = "700 20px sans-serif";
        ctx.fillStyle = isLight ? "#18181b" : "#f4f4f5";
        ctx.fillText(formatarNumero(totalExposto), centerX, centerY - 8);

        ctx.font = "500 11px sans-serif";
        ctx.fillStyle = isLight ? "#71717a" : "#a1a1aa";
        ctx.fillText("veículos", centerX, centerY + 12);
        ctx.restore();
      },
    }),
    [totalExposto, isLight]
  );

  const chartData = {
    labels: componentesOrdenados.map((item) => item.componente),
    datasets: [
      {
        data: componentesOrdenados.map((item) => item.veiculos),
        backgroundColor: componentesOrdenados.map(
          (_, idx) => CORES_GARGALOS[idx % CORES_GARGALOS.length]
        ),
        borderColor: isLight ? "#ffffff" : "#18181b",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        borderColor: "#27272a",
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        bodySpacing: 6,
        callbacks: {
          label: (context) => {
            const item = componentesOrdenados[context.dataIndex];
            if (!item) return "";

            return [
              `Expostos: ${formatarNumero(item.veiculos)} (${formatarNumero(
                item.detalhes.comerciais
              )} Comerciais, ${formatarNumero(
                item.detalhes.passeios
              )} Passeios, ${formatarNumero(item.detalhes.motos)} Motos)`,
              `Tempo em alerta: ${item.tempoAlerta}`,
              `Frequência: ${item.frequencia}`,
              `Severidade: ${item.severidade}`,
            ];
          },
        },
      },
    },
  };

  const specs = dadosPortico?.specs;

  return (
    <Card className="bg-background flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            Gargalos de Hardware
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Impacto por componente no pórtico
          </p>
        </div>

        <select
          value={porticoSelecionado}
          onChange={(e) => onSelectPortico(e.target.value)}
          className="border border-border rounded-md px-2.5 py-1 text-xs font-medium bg-background text-foreground focus:ring-2 focus:ring-ring"
        >
          {porticos.map((portico) => (
            <option key={portico} value={portico}>
              {portico}
            </option>
          ))}
        </select>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-1">
        {/* Linha de Contexto Técnico */}
        {specs && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border text-[11px] text-muted-foreground font-mono">
            <span>
              <strong className="text-foreground">Host:</strong> {specs.host}
            </span>
            <span>
              <strong className="text-foreground">CPU:</strong> {specs.cpu}
            </span>
            <span>
              <strong className="text-foreground">RAM:</strong> {specs.ram}
            </span>
            <span>
              <strong className="text-foreground">Disco:</strong> {specs.disco}
            </span>
          </div>
        )}

        {/* Rosca + Lista Ordenada */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
          <div className="sm:col-span-5 h-44 relative">
            <Doughnut
              key={porticoSelecionado}
              data={chartData}
              options={opcoes}
              plugins={[textoCentralPlugin]}
            />
          </div>

          <div className="sm:col-span-7 flex flex-col gap-2.5">
            {componentesOrdenados.map((item, idx) => {
              const percentual =
                totalExposto > 0
                  ? Math.round((item.veiculos / totalExposto) * 100)
                  : 0;
              const cor = CORES_GARGALOS[idx % CORES_GARGALOS.length];

              return (
                <div
                  key={item.componente}
                  title={`${item.tempoAlerta} | ${item.frequencia}`}
                  className="flex items-center justify-between text-xs border-b border-border/50 pb-1.5 last:border-none last:pb-0"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cor }}
                    />
                    <span className="font-medium text-foreground truncate">
                      {item.componente}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="font-semibold text-foreground">
                      {formatarNumero(item.veiculos)}
                    </span>
                    <span className="text-muted-foreground w-9 text-right">
                      ({percentual}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}