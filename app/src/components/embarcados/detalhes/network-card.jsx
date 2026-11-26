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
import { ChevronDownCircleIcon, ChevronUpCircleIcon } from "lucide-react";

export function NetworkCard({
  title,
  network,
  isLoading = false,
  notMonitoredMessage,
  compact = false,
}) {
  return (
    <Card
      size="sm"
      className={cn("w-full h-full", compact && "[--card-spacing:--spacing(2)]")}
    >
      <CardHeader className="relative">
        <CardTitle className={cn(compact && "text-sm")}>{title}</CardTitle>
        <CardDescription className="text-xs">
          {network.nome || "Sem dados"}
        </CardDescription>
        <Badge
          className={cn(
            "absolute top-2 right-2 border",
            network.status === "Normal" &&
              "border-primary bg-primary-foreground text-primary",
            network.status === "Atenção" &&
              "border-warning bg-warning-foreground text-warning",
            network.status === "Crítico" &&
              "border-destructive bg-destructive-foreground text-destructive",
          )}
        >
          {notMonitoredMessage ? "Não monitorado" : network.status}
        </Badge>
      </CardHeader>
      <CardContent className={"flex items-center h-full"}>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <h2 className={cn("font-bold font-heading", compact ? "text-2xl" : "text-3xl")}>
            {network.valor}
            {network.unidadeMedida}
          </h2>
        )}
      </CardContent>
      <CardFooter className={cn("text-xs text-text-muted flex space-x-2", compact && "py-2")}>
        {notMonitoredMessage ? (
          <span>{notMonitoredMessage}</span>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <ChevronUpCircleIcon size={16} />
              <span>
                {network.extra.download}
                {network.unidadeMedida}
              </span>
            </span>
            <p>•</p>
            <span className="flex items-center gap-1">
              <ChevronDownCircleIcon size={16} />
              <span>
                {network.extra.upload}
                {network.unidadeMedida}
              </span>
            </span>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
