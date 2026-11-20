import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResumoCards({ resumo }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Veículos Expostos no Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{resumo.total}</p>
          <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">{resumo.comerciais}</span> Comerciais
            </p>
            <p>
              <span className="font-semibold text-foreground">{resumo.passeios}</span> Passeios
            </p>
            <p>
              <span className="font-semibold text-foreground">{resumo.motos}</span> Motos
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Pórtico com Maior Tráfego Exposto
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center pb-8">
          <p className="text-2xl font-bold">{resumo.maiorPortico}</p>
        </CardContent>
      </Card>

      <Card className="bg-background flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Índice de Cobertura Oficial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center pb-8">
          <p className="text-2xl font-bold">{resumo.cobertura}</p>
        </CardContent>
      </Card>
    </section>
  );
}