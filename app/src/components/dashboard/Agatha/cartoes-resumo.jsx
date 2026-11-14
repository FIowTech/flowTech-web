
const cards = [
  {
    id: "normal",
    title: "Normal",
    value: 12,
    description: "Equipamentos operando normalmente",
    color: "text-green-600",
    border: "border-green-500",
    background: "bg-green-500/10",
  },
  {
    id: "alerta",
    title: "Alerta",
    value: 4,
    description: "Precisam de atenção",
    color: "text-yellow-600",
    border: "border-yellow-500",
    background: "bg-yellow-500/10",
  },
  {
    id: "critico",
    title: "Crítico",
    value: 2,
    description: "Exigem atenção imediata",
    color: "text-red-600",
    border: "border-red-500",
    background: "bg-red-500/10",
  },
  {
    id: "pendente",
    title: "Sem encaminhamento",
    value: 3,
    description: "Aguardando um responsável",
    color: "text-muted-foreground",
    border: "border-border",
    background: "bg-muted",
  },
];

export default function SummaryCards({ selectedFilter, onFilter }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onFilter(card.id)}
          aria-pressed={selectedFilter === card.id}
          className={`flex flex-col gap-3 rounded-xl border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:shadow-md ${
            selectedFilter === card.id
              ? `${card.border} ring-1 ring-current`
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {card.title}
            </span>

            <span
              className={`size-2.5 rounded-full ${card.background}`}
            />
          </div>

          <span className={`text-3xl font-bold ${card.color}`}>
            {card.value}
          </span>

          <span className="text-xs text-muted-foreground">
            {card.description}
          </span>
        </button>
      ))}
    </div>
  );
}
