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

export function ComponentesMonitoradosField({ fields, handler }) {
  return (
    <FieldSet className="min-w-0">
      <FieldLegend>Componentes Monitorados</FieldLegend>
      <FieldDescription>
        Selecione quais componentes e métricas o cliente deve monitorar.
      </FieldDescription>

      <FieldGroup className="grid grid-cols-6 gap-4">
        {Object.entries(fields).map(([key, componente]) => (
          <ComponenteMetricas
            key={key}
            cKey={key}
            componente={componente}
            handler={handler}
          />
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

function ComponenteMetricas({ cKey, componente, handler }) {
  const { nome, metricas } = componente;

  const areAllMetricasChecked = Object.values(metricas).every(
    (m) => m.monitorado,
  );

  const handleComponenteCheckAll = (checked) => {
    handler((prev) => {
      const metricasAtualizadas = Object.fromEntries(
        Object.entries(metricas).map(([key, metrica]) => [
          key,
          { ...metrica, monitorado: checked },
        ]),
      );

      return {
        ...prev,
        [cKey]: { ...prev[cKey], metricas: metricasAtualizadas },
      };
    });
  };

  const handleMetricaField = (metrica, field, value) => {
    handler((prev) => ({
      ...prev,
      [cKey]: {
        ...prev[cKey],
        metricas: {
          ...prev[cKey].metricas,
          [metrica]: {
            ...prev[cKey].metricas[metrica],
            [field]: value,
          },
        },
      },
    }));
  };

  return (
    <Card className="col-span-2" size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Checkbox
            id={`check-all-${cKey}`}
            checked={areAllMetricasChecked}
            onCheckedChange={handleComponenteCheckAll}
          />
          <p>{nome}</p>
        </CardTitle>

        <CardContent>
          <ul>
            {Object.entries(metricas).map(([key, metrica]) => (
              <li key={metrica.id} className="flex flex-col space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`check-${key}-${cKey}`}
                    checked={metrica.monitorado}
                    onCheckedChange={(checked) =>
                      handleMetricaField(key, "monitorado", checked)
                    }
                  />
                  <p>
                    {metrica.nome}{" "}
                    <span className="text-xs text-text-muted">
                      (
                      {metrica.unidadeMedida === "pct"
                        ? "%"
                        : metrica.unidadeMedida}
                      )
                    </span>
                  </p>
                </div>
                {metrica.monitorado && (
                  <FieldGroup className="w-full flex flex-row items-center gap-2 p-2">
                    <Field>
                      <FieldLabel className="text-xs">Limite Máximo</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={metrica.unidadeMedida === "pct" && 100}
                        className="text-xs rounded-md"
                        value={metrica.limiteMax}
                        onChange={(e) =>
                          handleMetricaField(
                            key,
                            "limiteMax",
                            Math.max(
                              0,
                              metrica.unidadeMedida === "pct"
                                ? Math.min(100, e.target.value)
                                : e.target.value,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs">Limite Mínimo</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        max={metrica.unidadeMedida === "pct" && 100}
                        className="text-xs rounded-md"
                        value={metrica.limiteMin}
                        onChange={(e) =>
                          handleMetricaField(
                            key,
                            "limiteMin",
                            Math.max(
                              0,
                              metrica.unidadeMedida === "pct"
                                ? Math.min(100, e.target.value)
                                : e.target.value,
                            ),
                          )
                        }
                      />
                    </Field>
                  </FieldGroup>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
