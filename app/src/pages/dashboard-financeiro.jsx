import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFinanceiro() {
  return (
    <div className="w-full min-h-dvh flex flex-col gap-2 bg-background-dark">
      {/* Conteúdo Principal */}
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
          <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground">
            <option>Selecione o período</option>
            <option>Mês atual</option>
          </select>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos Expostos no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">52.000</p>
            <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <p><span className="font-semibold text-foreground">8.900</span> Comerciais</p>
              <p><span className="font-semibold text-foreground">3.000</span> Passeios</p>
              <p><span className="font-semibold text-foreground">1.200</span> Motos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pórtico com Maior Tráfego Exposto</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center pb-8">
            <p className="text-2xl font-bold">PADR-SR099</p>
          </CardContent>
        </Card>

        <Card className="bg-background flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Índice de Cobertura Oficial</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center pb-8">
            <p className="text-2xl font-bold">97%</p>
          </CardContent>
        </Card>
      </section>

      {/* HORIZONTAL BAR CHART SKELETON */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Pórticos com a Maior Exposição de Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 relative border-l border-border pl-2">
            <div className="absolute inset-y-0 left-[25%] border-l border-border border-dashed z-0" />
            <div className="absolute inset-y-0 left-[50%] border-l border-border border-dashed z-0" />
            <div className="absolute inset-y-0 left-[75%] border-l border-border border-dashed z-0" />
            
            {[60, 45, 30, 8, 5].map((width, index) => (
              <div key={index} className="flex items-center gap-4 z-10">
                <span className="text-sm font-medium w-24 text-right">
                  padr-xxxxx
                </span>
                <div className="flex-1">
                  <div
                    className="h-4 bg-muted-foreground/30 rounded-r-sm border border-border"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="w-full border-b border-border mt-2 z-10" />
          </div>
        </CardContent>
      </Card>

      <div className="w-full h-px bg-border my-2" />

      {/* SELECTION AND DETAILS SECTION */}
      <section className="flex flex-col gap-4">
        
        {/* Pórtico Selector */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium">Selecionar o pórtico</label>
          <select className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm text-foreground focus:ring-2 focus:ring-ring">
            <option>Selecione um pórtico...</option>
            <option>padr-00001</option>
          </select>
        </div>
      </section>

      {/* VERTICAL STACKED BAR CHART SKELETON */}
      <Card className="bg-background">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">
            Tráfego de veículos expostos
          </CardTitle>
          <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-background">
            <option>Selecione o período</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full border-b border-border flex items-end justify-around relative pt-4 pb-2">
            
            {/* Grid lines */}
            <div className="absolute inset-x-0 bottom-1/4 border-b border-border border-dashed z-0" />
            <div className="absolute inset-x-0 bottom-2/4 border-b border-border border-dashed z-0" />
            <div className="absolute inset-x-0 bottom-3/4 border-b border-border border-dashed z-0" />
          </div>

          {/* Legend */}
          <div className="flex justify-end gap-6 mt-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-muted border border-border" /> 
              normal
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-yellow-400 border-[2px]" /> 
              alerta
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-red-500 border-[2px]" /> 
              crítico
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-wrap items-center gap-6 pt-2 pb-8">
        <button className="text-sm text-foreground font-semibold hover:underline">
          [ emitir relatório ]
        </button>
        <button className="text-sm text-foreground font-semibold hover:underline">
          [ configurar dados do pórtico ]
        </button>
        <button className="text-sm text-foreground font-semibold hover:underline">
          [ visualizar critérios ]
        </button>
      </div>
      <main className="max-w-6xl w-full mx-auto flex flex-col p-6">
      </main>
    </div>
  );
}