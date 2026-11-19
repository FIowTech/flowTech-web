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
import { ChevronDownCircleIcon, ChevronUpCircleIcon } from "lucide-react";

export function NetworkCard({ title, network }) {
  return (
    <Card size="sm" className="w-full h-full">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-xs">{network.nome}</CardDescription>
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
          {network.status}
        </Badge>
      </CardHeader>
      <CardContent className={"flex items-center h-full"}>
        <h2 className="text-3xl font-bold font-heading">
          {network.valor}
          {network.unidadeMedida}
        </h2>
      </CardContent>
      <CardFooter className="text-xs text-text-muted flex space-x-2">
        <span className="flex items-center gap-1">
          <ChevronUpCircleIcon size={16} />{" "}
          <span>
            {network.extra.download}
            {network.unidadeMedida}
          </span>
        </span>{" "}
        <p>•</p>
        <span className="flex items-center gap-1">
          <ChevronDownCircleIcon size={16} />{" "}
          <span>
            {network.extra.upload}
            {network.unidadeMedida}
          </span>
        </span>
      </CardFooter>
    </Card>
  );
}
