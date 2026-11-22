
const statusStyles = {
  normal: "bg-green-500/10 text-green-600",
  alerta: "bg-yellow-500/10 text-yellow-600",
  critico: "bg-red-500/10 text-red-600",
};

const statusLabels = {
  normal: "Normal",
  alerta: "Alerta",
  critico: "Crítico",
};

export default function AlertTable({
  alerts,
  selectedAlert,
  onSelectAlert,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold">Fila de alertas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {alerts.length} alertas encontrados
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-900px text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Embarcado</th>
              <th className="px-4 py-3">Recurso</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Recorrência 30 d</th>
              
              
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {alerts.map((alert) => (
              <tr
               key={alert.id}
               onClick={() => onSelectAlert(alert)}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedAlert?.id === alert.id ? "bg-primary/10" : ""
               }`}
              >
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusStyles[alert.estado]
                    }`}
                  >
                    {statusLabels[alert.estado]}
                  </span>
                </td>

                <td className="px-4 py-4 font-medium">
                  {alert.embarcado}
                </td>

                <td className="px-4 py-4">{alert.recurso}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {alert.inicio}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {alert.duracao}
                </td>
                <td className="px-4 py-4">{alert.recorrencia}</td>

                
              </tr>
            ))}

            {alerts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Nenhum alerta encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
