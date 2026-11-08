import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TODAS_AS_REGIOES } from "@/utils/regioes";
import { useState } from "react";

const statusOpcoes = [
  {
    id: "controlado",
    nome: "Controlado",
    cor: "bg-linear-to-b from-[#5ace8b] to-[#4eaf89]",
  },
  {
    id: "alerta",
    nome: "Alerta",
    cor: "bg-linear-to-b from-[#f1c453] to-[#d9a540]",
  },
  {
    id: "critico",
    nome: "Crítico",
    cor: "bg-linear-to-b from-[#d04f5e] to-[#c34557]",
  },
];

// regioes: lista de regiões da empresa, filtros: o que está aplicado hoje
// onAplicar: recebe os filtros novos, ex.: { regiao: santos, status: critico }
export function FiltrosMapa({ open, onOpenChange, regioes, filtros, onAplicar }) {
  const handleAplicar = (novosFiltros) => {
    onAplicar(novosFiltros);
    onOpenChange(false); // fecha o popup
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>

        <FiltrosForm
          regioes={regioes}
          filtros={filtros}
          onAplicar={handleAplicar}
        />
      </DialogContent>
    </Dialog>
  );
}

function FiltrosForm({ regioes, filtros, onAplicar }) {
  const [regiao, setRegiao] = useState(filtros.regiao);
  const [status, setStatus] = useState(filtros.status);

   const alternarStatus = (id) => {
  if (status.includes(id)) {
    setStatus(status.filter((s) => s !== id));
  } else {
    setStatus([...status, id]);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    onAplicar({ regiao, status });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filtro-regiao">Localização</Label>

        <Select value={regiao} onValueChange={setRegiao}>
          <SelectTrigger id="filtro-regiao" className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={TODAS_AS_REGIOES}>{TODAS_AS_REGIOES}</SelectItem>

            {regioes.map((nome) => (
              <SelectItem key={nome} value={nome}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status do servidor</Label>

        <div role="group" aria-label="Status do servidor" className="flex gap-2">
          {statusOpcoes.map((opcao) => {
            const ativo = status.includes(opcao.id);

            return (
              <button
                key={opcao.id}
                type="button"
                aria-pressed={ativo}
                onClick={() => alternarStatus(opcao.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  ativo
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background-light text-muted-foreground hover:bg-secondary",
                )}
              >
                <span className={cn("size-3 rounded-full", opcao.cor)} />
                {opcao.nome}
              </button>
            );
          })}
        </div>

      </div>

      <Button type="submit" className="w-full">
        Aplicar filtros
      </Button>
    </form>
  );
}
