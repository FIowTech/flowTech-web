import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function MetricaPainel({
  titulo,
  valor,
  descricao,
  className,
  children,
}) {
  return (
    <Card size="sm" className={cn("min-h-72", className)}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{valor}</span>
          {descricao && (
            <span className="text-xs text-muted-foreground">{descricao}</span>
          )}
        </div>

        {/* O Chart.js precisa de um pai "relative" com altura definida */}
        <div className="relative h-48">{children}</div>
      </CardContent>
    </Card>
  );
}
