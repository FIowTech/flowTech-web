import { FunnelIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ServidorBusca({ value, onChange }) {
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

      <Button type="button" variant="outline" size="icon-lg">
        <FunnelIcon />
      </Button>
    </div>
  );
}
