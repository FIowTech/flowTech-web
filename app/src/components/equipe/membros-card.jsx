import { LABELS_NIVEIS_ACESSO } from "@/constants/labels-niveis-acesso";
import { Card, CardContent } from "../ui/card";

export function MembrosCard({ membro }) {
  let iniciais = membro.nome.charAt(0);
  if (membro.nome.split(" ").length >= 2) {
    iniciais += membro.nome.split(" ")[1].charAt(0);
  }

  return (
    <Card key={membro.id}>
      <CardContent className="flex flex-row items-center gap-2">
        <div className="bg-background border border-border rounded-full p-2">
          {iniciais.toUpperCase()}
        </div>
        <div>
          <h3 className="truncate font-medium">{membro.nome}</h3>
          <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
            {LABELS_NIVEIS_ACESSO[membro.nivel_acesso]} • {membro.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/*
{membro.email !== usuarioLogado?.email && (
        <Button
          type="button"
          variant="outline"
          aria-label={`Editar ${membro.nome}`}
          className="shrink-0 cursor-pointer"
        >
          <PencilSimpleIcon />
        </Button>
      )}
*/
