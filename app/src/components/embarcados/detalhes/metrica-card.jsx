import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

// variation = line | radial
export function MetricaCard({ title, variation = "line", metrica }) {
  const footerMessage = metrica.extra.mensagem || `${metrica.valorPct}% em uso`;

  return (
    <Card size="sm" className="w-full h-full">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-xs">{metrica.nome}</CardDescription>
        <Badge
          className={cn(
            "absolute top-2 right-2 border",
            metrica.status === "Normal" &&
              "border-primary bg-primary-foreground text-primary",
            metrica.status === "Atenção" &&
              "border-warning bg-warning-foreground text-warning",
            metrica.status === "Crítico" &&
              "border-destructive bg-destructive-foreground text-destructive",
          )}
        >
          {metrica.status}
        </Badge>
      </CardHeader>
      <CardContent
        className={cn(
          "flex h-full",
          variation === "line"
            ? "flex-col space-y-4"
            : "items-center justify-around",
        )}
      >
        <h2 className="text-3xl font-bold font-heading">
          {metrica.valor}
          {metrica.unidadeMedida}
        </h2>
        <MetricGraph
          value={metrica.valor}
          total={metrica.total}
          variation={variation}
        />
      </CardContent>
      <CardFooter className="text-xs text-text-muted">
        {footerMessage}
      </CardFooter>
    </Card>
  );
}

function MetricGraph({ value, total, variation }) {
  const width = (Number(value) / Number(total)) * 100;

  const lineGraph = (
    <div className="overflow-hidden rounded-full w-full h-3 bg-background border border-border flex">
      <div className="rounded-r-full h-full bg-primary" style={{ width }}></div>
    </div>
  );

  const circleGraph = (
    <div className="h-17 aspect-square rounded-full bg-background border border-border"></div>
  );

  return variation === "line" ? lineGraph : circleGraph;
}
