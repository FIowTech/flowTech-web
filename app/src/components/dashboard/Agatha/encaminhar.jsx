
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useFetchUsuarios } from "@/hooks/useFetchUsuarios";
import { LABELS_NIVEIS_ACESSO } from "@/constants/labels-niveis-acesso";

export default function Encaminhar({ alert }) {


const { usuarios, isLoading } = useFetchUsuarios();

const [tecnico, setTecnico] = useState("");
const [observacao, setObservacao] = useState("");
  return (
    <Card size="sm" className="w-full bg-background">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-foreground">
            Encaminhar alerta
          </h2>

          <p className="text-xs text-muted-foreground">
            Direcione o alerta para um técnico responsável.
          </p>
        </div>

        {/* Técnico responsável */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground">
            Técnico responsável
          </label>

        <select
  value={tecnico}
  onChange={(e) => setTecnico(e.target.value)}
  disabled={isLoading}
  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
>
  <option value="">
    {isLoading ? "Carregando membros..." : "Selecione um responsável"}
  </option>

  {usuarios.map((membro) => (
    <option key={membro.id_usuario} value={membro.id_usuario}>
      {membro.nome} • {LABELS_NIVEIS_ACESSO[membro.nivel_acesso]}
    </option>
  ))}
</select>
        </div>

        {/* Observação */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground">
            Observação
          </label>

          <textarea
  rows={3}
  value={observacao}
  onChange={(e) => setObservacao(e.target.value)}
  placeholder="Descreva o problema ou as orientações..."
  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs"
/>
        </div>

        {/* Pacote de contexto */}
        <Secao titulo="Pacote de contexto">
          <p className="text-xs text-muted-foreground">
            Informações do alerta serão incluídas para auxiliar o técnico.
          </p>

          {alert && (
            <div className="flex flex-col gap-2">
              <Linha label="Embarcado:" valor={alert.embarcado} />
              <Linha label="Recurso:" valor={alert.recurso} />
              <Linha label="Estado:" valor={alert.estado} />
              <Linha label="Início:" valor={alert.inicio} />
            </div>
          )}
        </Secao>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            Cancelar
          </button>

          <button
            type="button"
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Encaminhar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function Secao({ titulo, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="border-b pb-1 text-xs font-bold text-foreground">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Linha({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      {label}
      <Badge
        variant="secondary"
        className="h-auto rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
      >
        {valor || "—"}
      </Badge>
    </div>
  );
}
