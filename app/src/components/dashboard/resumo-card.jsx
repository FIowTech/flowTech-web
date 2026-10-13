import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

const statusColors = {
  verde: "bg-success text-success-foreground",
  amarelo: "bg-warning text-warning-foreground",
  vermelho: "bg-destructive text-danger-foreground",
};

export function ResumoCard({ titulo, icon: Icon, atualizadoEm, children }) {
  return (
    <Card size="sm" className="flex-1">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>

        <CardAction className="rounded-md bg-secondary p-1.5 text-muted-foreground">
          <Icon size={16} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-2xl font-bold">
          {children}
        </div>

        <span className="self-end text-[10.5px] text-muted-foreground">
          atualizado às {atualizadoEm}
        </span>
      </CardContent>
    </Card>
  );
}

export function StatusCount({ status, quantidade }) {
  return (
    <span className="flex items-center gap-1.5">
      {quantidade}
      <span
        aria-label={status}
        className={cn("size-5 rounded-full", statusColors[status])}
      />
    </span>
  );
}

export function ResumoTotal({ total }) {
  return <span className="text-xs font-normal text-muted-foreground">de {total}</span>;
}
