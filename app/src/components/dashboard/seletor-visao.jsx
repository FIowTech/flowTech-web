import { cn } from "@/lib/utils";

const visoes = [
  { id: "mapa", nome: "Mapa" },
  { id: "calor", nome: "Mapa de Calor" },
];

// value: "mapa" ou "calor" | onChange: recebe o id da visão escolhida
export function SeletorVisao({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Visão do mapa"
      className="inline-flex self-start rounded-lg bg-secondary p-1"
    >
      {visoes.map((visao) => (
        <button
          key={visao.id}
          type="button"
          aria-pressed={value === visao.id}
          onClick={() => onChange(visao.id)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-all",
            value === visao.id
              ? "bg-background-light text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {visao.nome}
        </button>
      ))}
    </div>
  );
}
