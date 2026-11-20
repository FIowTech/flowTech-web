import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoBarrasHorizontais } from "@/components/dashboard/graficos";

export function GraficoRankingPorticos({ dados, porticoSelecionado, onSelectPortico }) {
  return (
    <Card className="bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Pórticos com a Maior Exposição de Tráfego
        </CardTitle>
        <CardDescription className="text-xs">
          Clique em uma barra para inspecionar os gargalos de hardware do pórtico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-full min-h-[250px] w-full">
          <GraficoBarrasHorizontais
            labels={dados.map((item) => item.portico)}
            valores={dados.map((item) => item.veiculos)}
            nomeSerie="Veículos Expostos"
            itemSelecionado={porticoSelecionado}
            onBarClick={onSelectPortico}
          />
        </div>
      </CardContent>
    </Card>
  );
}