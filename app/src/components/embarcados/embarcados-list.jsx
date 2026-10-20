import { Button } from "@/components/ui/button";
import { ArrowsCounterClockwiseIcon, EmptyIcon } from "@phosphor-icons/react";
import { EmbarcadoCard } from "./embarcado-card";

export function EmbarcadosList({ embarcados, refetch }) {
  return (
    <ul className="w-full flex flex-col space-y-2">
      {embarcados.length > 0 ? (
        embarcados.map((emb) => (
          <li key={emb.id_embarcado}>
            <EmbarcadoCard embarcado={emb} />
          </li>
        ))
      ) : (
        <div className="p-2 w-full flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-fit p-1 rounded-md bg-destructive-foreground text-destructive border border-destructive">
              <EmptyIcon />
            </div>
            <h3 className="text-xl font-heading">Sem Resultados...</h3>
            <p className="text-text-muted text-sm max-w-2/3 w-full mx-auto text-center">
              Não foi possível encontrar nenhum embarcado com essas
              específicações.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refetch}
            className="flex items-center gap-2"
          >
            <ArrowsCounterClockwiseIcon />
            <span>Buscar novamente</span>
          </Button>
        </div>
      )}
    </ul>
  );
}
