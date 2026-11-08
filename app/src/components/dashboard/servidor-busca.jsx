import { FunnelIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// onFiltrarClick: abre o popup de filtros | filtrosAtivos: quantos filtros estão aplicados
export function ServidorBusca({
  value,
  onChange,
  onFiltrarClick,
  filtrosAtivos = 0,
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-background p-2 ring-1 ring-foreground/10">
      <div className="relative flex-1">
        <MagnifyingGlassIcon
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          value={value}
          onChange={onChange}
          placeholder="Buscar servidor por apelido, modelo ou localização"
          className="h-9 rounded-[9px] border-input bg-background-light pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button
        type="button"
        variant={filtrosAtivos > 0 ? "default" : "outline"}
        size="icon-lg"
        aria-label="Abrir filtros"
        onClick={onFiltrarClick}
        className="relative"
      >
        <FunnelIcon />

        {filtrosAtivos > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
            {filtrosAtivos}
          </span>
        )}
      </Button>
    </div>
  );
}
