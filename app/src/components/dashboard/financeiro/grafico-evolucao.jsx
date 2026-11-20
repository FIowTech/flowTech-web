import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoLinha } from "@/components/dashboard/graficos";

export function GraficoEvolucaoExposicao({ porticoSelecionado, dadosEvolucao }) {
  const labels = dadosEvolucao.map((item) => item.data);

  const linhas = [
    {
      nome: "Total de Veículos Expostos",
      valores: dadosEvolucao.map((item) => item.total),
      cor: "#313131",
    },
    {
      nome: "Comerciais Expostos",
      valores: dadosEvolucao.map((item) => item.comerciais),
      cor: "#2c2c2c",
    },
  ];

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            Evolução da Exposição no Período — {porticoSelecionado}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tendência diária de tráfego afetado para identificar degradação progressiva ou picos isolados
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-56 w-full pt-2">
          <GraficoLinha labels={labels} linhas={linhas} area={true} />
        </div>
      </CardContent>
    </Card>
  );
}