import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { mascaraEnderecoMac } from "@/utils/mascaras";

const MAX_CHARACTERS_APELIDO = 60;
const MAX_CHARACTERS_MODELO = 60;

export function InformacoesGeraisFields({ fields, handler, editing }) {
  const handleApelidoChange = (e) => {
    handler((prev) => ({ ...prev, apelido: e.target.value }));
  };

  const handleModeloChange = (e) => {
    handler((prev) => ({ ...prev, modelo: e.target.value }));
  };

  const handleEnderecoMacChange = (e) => {
    const value = String(e.target.value).toUpperCase();
    if (value !== "" && !/^[0-9A-F:]+$/.test(value)) return;

    handler((prev) => ({
      ...prev,
      endereco_mac: mascaraEnderecoMac(value),
    }));
  };

  return (
    <FieldSet className="min-w-0">
      <FieldLegend>Informações Gerais</FieldLegend>
      <FieldDescription>
        Serão utilizadas para identificar o embarcado após sua criação.
      </FieldDescription>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="criar-embarcado-enderecomac">
            Endereço MAC <span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Input
            id="criar-embarcado-enderecomac"
            className="max-w-xs"
            type="text"
            placeholder="00:00:00:00:00:00"
            value={fields.endereco_mac}
            onChange={handleEnderecoMacChange}
            disabled={editing}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="criar-embarcado-modelo">
            Modelo <span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="criar-embarcado-modelo"
              type="text"
              placeholder="PADR-SR1980"
              value={fields.modelo}
              onChange={handleModeloChange}
              maxLength={MAX_CHARACTERS_MODELO}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                {fields.modelo.length}/{MAX_CHARACTERS_MODELO}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="criar-embarcado-apelido">
            Apelido <span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="criar-embarcado-apelido"
              type="text"
              placeholder="SRV-001"
              value={fields.apelido}
              onChange={handleApelidoChange}
              maxLength={MAX_CHARACTERS_APELIDO}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                {fields.apelido.length}/{MAX_CHARACTERS_APELIDO}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
