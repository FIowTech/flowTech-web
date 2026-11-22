
const cards = [
  {
    id: "alerta",
    title: "Alerta",
    description: "Precisam de atenção",
    color: "text-yellow-600",
    border: "border-yellow-500",
    background: "bg-yellow-500",
  },
  {
    id: "critico",
    title: "Crítico",
    description: "Exigem atenção imediata",
    color: "text-red-600",
    border: "border-red-500",
    background: "bg-red-500",
  },
];

export default function SummaryCards({
  selectedFilter,
  onFilter,
  quantidadeAlerta,
  quantidadeCritico,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() =>
            onFilter(selectedFilter === card.id ? null : card.id)
          }
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
            {card.id === "alerta" ? quantidadeAlerta : quantidadeCritico}
          </span>

          <span className="text-xs text-muted-foreground">
            {card.description}
          </span>
        </button>
      ))}
    </div>
  );
}
