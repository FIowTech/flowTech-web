import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/store/auth-store";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function EmbarcadoCard({ embarcado }) {
  const { apelido, modelo, endereco_mac, status } = embarcado;
  const nivelAcesso = useAuth((state) => state.usuario?.nivel_acesso);

  return (
    <Card size="sm" className="rounded-md">
      <CardContent className="flex items-center justify-between">
        <div className="w-full flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-lg">{apelido}</h3>
            <EmbarcadoStatusBadge
              status={status === 1 ? "controlado" : "critico"}
            />
          </div>
          <span className="text-text-muted text-xs">
            {endereco_mac} • {modelo}
          </span>
        </div>

        {nivelAcesso <= 1 && (
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            <PencilSimpleLineIcon />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function EmbarcadoStatusBadge({ status }) {
  const statusColors =
    status === "controlado"
      ? "bg-primary-foreground border border-primary text-primary"
      : status === "atencao"
        ? "bg-warning-foreground border border-warning text-warning"
        : "bg-destructive-foreground border border-destructive text-destructive";

  return <Badge className={cn("border", statusColors)}>{status}</Badge>;
}
