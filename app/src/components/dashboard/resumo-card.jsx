import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";

const statusColors = {
  verde: "bg-linear-to-b from-[#5ace8b] to-[#4eaf89]",
  amarelo: "bg-linear-to-b from-[#f1c453] to-[#d9a540]",
  vermelho: "bg-linear-to-b from-[#d04f5e] to-[#c34557]",
};

const tons = {
  neutro: "bg-foreground/15",
  warning: "bg-warning/50",
  destructive: "bg-destructive/30",
};

export function ResumoCard({
  titulo,
  icon: Icon,
  tom = "neutro",
  atualizadoEm,
  children,
}) {
  return (
    <Card size="sm" className="flex-1 bg-background">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>

        <CardAction className={cn("rounded-md p-1.5 text-foreground/70", tons[tom])}>
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
