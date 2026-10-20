import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ComponentesMonitoradosFields({ fields, handler }) {
  return (
    <FieldSet>
      <FieldLegend>Componentes Monitorados</FieldLegend>
      <FieldDescription>
        Selecione quais componentes e métricas o cliente deve monitorar.
      </FieldDescription>

      <FieldGroup className="grid grid-cols-6 gap-4">
        {fields.map((componente) => (
          <ComponenteCard
            key={componente.id_componente}
            componente={componente}
            handler={handler}
          />
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

function ComponenteCard({ componente, handler }) {
  const {
    id_componente,
    nome,
    descricao,
    unidade_medida,
    status,
    limite_max,
    limite_min,
  } = componente;
  const nomeComponente = nome.split("_")[0].toUpperCase();

  const isChecked = !!status;
  const isPct = unidade_medida === "pct";

  const onCheck = (checked) =>
    handler((prev) =>
      prev.map((c) =>
        c.id_componente === id_componente
          ? { ...c, status: checked ? 1 : 0 }
          : c,
      ),
    );

  const onChangeMaxLimit = (value) =>
    handler((prev) =>
      prev.map((c) =>
        c.id_componente === id_componente
          ? {
              ...c,
              limite_max: value,
            }
          : c,
      ),
    );

  const onChangeMinLimit = (value) =>
    handler((prev) =>
      prev.map((c) =>
        c.id_componente === id_componente
          ? {
              ...c,
              limite_min: value,
            }
          : c,
      ),
    );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex flex-col">
          <p className="flex items-center gap-1">
            <Checkbox
              id={`check-${nome}`}
              checked={status}
              onCheckedChange={onCheck}
            />
            {nomeComponente}
          </p>
          <div className="flex items-center gap-1">
            <p>- {descricao}</p>
            <span className="text-xs text-text-muted">
              ({isPct ? "%" : unidade_medida})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isChecked && (
          <FieldGroup className="w-full flex flex-row items-center gap-2 p-2">
            <Field>
              <FieldLabel className="text-xs">Limite Máximo</FieldLabel>
              <Input
                type="number"
                className="text-xs rounded-md"
                min={limite_min ?? undefined}
                value={limite_max}
                onChange={(e) => onChangeMaxLimit(Number(e.target.value))}
              />
            </Field>
            <Field>
              <FieldLabel className="text-xs">Limite Mínimo</FieldLabel>
              <Input
                type="number"
                className="text-xs rounded-md"
                max={limite_max ?? undefined}
                value={limite_min}
                onChange={(e) => onChangeMinLimit(Number(e.target.value))}
              />
            </Field>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}
