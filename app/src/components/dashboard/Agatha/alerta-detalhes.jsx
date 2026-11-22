
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AlertDetails({ alert }) {
  if (!alert) {
    return (
      <Card size="sm" className="w-full bg-background">
        <CardContent className="text-sm text-muted-foreground">
          Selecione um alerta na tabela para ver os detalhes.
        </CardContent>
      </Card>
    );
  }

  const statusStyles = {
    normal: "bg-green-500/10 text-green-600",
    alerta: "bg-yellow-500/10 text-yellow-600",
    critico: "bg-red-500/10 text-red-600",
  };

  return (
    <Card size="sm" className="w-full bg-background">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Detalhes do alerta
            </span>
            <h2 className="text-sm font-bold text-foreground">
              {alert.embarcado}
            </h2>
          </div>

          <Badge className={statusStyles[alert.estado]}>
            {(alert.estado).toUpperCase()}
          </Badge>
        </div>

        <Secao titulo="Informações do alerta">
          <Linha label="Recurso:" valor={alert.recurso} />
          <Linha label="Início:" valor={alert.inicio} />
          <Linha label="Duração:" valor={alert.duracao} />
          <Linha
            label="Recorrência (30 dias):"
            valor={alert.recorrencia}
          />
        </Secao>

        <Secao titulo="Informações do equipamento">
          <Linha label="Status da conexão:" valor="Não informado" />
          <Linha
            label="Classificação sugerida:"
            valor={alert.estado}
          />
        </Secao>

        <button
          type="button"
          disabled
          className="w-full rounded-md border px-3 py-2 text-xs font-medium text-muted-foreground opacity-60"
        >
          Ver mais detalhes
        </button>
        
        <button
  type="button"
  disabled
  className="w-full rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground opacity-60 cursor-not-allowed"
>
  Gerar relatório (PDF)
</button>
      </CardContent>
    </Card>
  );
}

function Secao({ titulo, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="border-b pb-1 text-xs font-bold text-foreground">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Linha({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      {label}
      <Valor>{valor || "—"}</Valor>
    </div>
  );
}

function Valor({ children }) {
  return (
    <Badge
      variant="secondary"
      className="h-auto rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
    >
      {children}
    </Badge>
  );
}
