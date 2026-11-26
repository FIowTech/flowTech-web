import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

// variation = line | circle
export function MetricaCard({
  title,
  variation = "line",
  metrica,
  isLoading = false,
  notMonitoredMessage,
  compact = false,
}) {
  const footerMessage = notMonitoredMessage
    ? notMonitoredMessage
    : metrica.extra?.mensagem || `${metrica.valorPct}% em uso`;

  return (
    <Card
      size="sm"
      className={cn("w-full h-full", compact && "[--card-spacing:--spacing(2)]")}
    >
      <CardHeader className="relative">
        <CardTitle className={cn(compact && "text-sm")}>{title}</CardTitle>
        <CardDescription className="text-xs">
          {metrica.nome || "Sem dados"}
        </CardDescription>
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
          {notMonitoredMessage ? "Não monitorado" : metrica.status}
        </Badge>
      </CardHeader>
      <CardContent
        className={cn(
          "flex h-full",
          variation === "line"
            ? "flex-col space-y-4"
            : "items-center justify-around",
          compact && "pt-1",
        )}
      >
        {isLoading ? (
          <div className="w-full space-y-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        ) : (
          <>
            <h2 className={cn("font-bold font-heading", compact ? "text-2xl" : "text-3xl")}>
              {metrica.valor}
              {metrica.unidadeMedida}
            </h2>
            <MetricGraph
              value={notMonitoredMessage ? 0 : metrica.valor}
              total={metrica.total}
              variation={variation}
            />
          </>
        )}
      </CardContent>
      <CardFooter className={cn("text-xs text-text-muted", compact && "py-2")}>
        {footerMessage}
      </CardFooter>
    </Card>
  );
}

function MetricGraph({ value, total, variation }) {
  const safeTotal = Number(total) > 0 ? Number(total) : 100;
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const width = Math.min(100, Math.max(0, (safeValue / safeTotal) * 100));

  const lineGraph = (
    <div className="overflow-hidden rounded-full w-full h-3 bg-background border border-border flex">
      <div className="rounded-r-full h-full bg-primary" style={{ width }}></div>
    </div>
  );

  const circleGraph = (
    <div className="h-17 aspect-square relative">
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(width / 100) * (2 * Math.PI * 24)} ${2 * Math.PI * 24}`}
          transform="rotate(-90 32 32)"
        />
      </svg>
    </div>
  );

  return variation === "line" ? lineGraph : circleGraph;
}
