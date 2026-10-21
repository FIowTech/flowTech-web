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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { UF } from "@/constants/uf";
import { mascaraCep } from "@/utils/mascaras";
import { useEffect, useState } from "react";

const MAX_CHARACTERS_COMPLEMENTO = 60;
const SENTIDOS = ["Norte", "Sul", "Leste", "Oeste"];

export function EnderecoFields({ fields, handler, editing }) {
  const [isLoading, setIsLoading] = useState(false);

  const [cepInput, setCepInput] = useState(mascaraCep(fields.cep) || "");

  useEffect(() => {
    if (editing) return;

    const cepLimpo = cepInput.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const viaCepResponse = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        if (!viaCepResponse.ok) {
          throw new Error(
            "Houve um erro ao requisitar informações de endereço.",
          );
        }

        const viaCepData = await viaCepResponse.json();
        if (viaCepData.erro) {
          throw new Error("CEP não encontrado.");
        }
        const { cep, logradouro, bairro, localidade, uf } = viaCepData;

        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&postalcode=${cep.replace("-", "")}&street=${encodeURIComponent(logradouro)}&city=${encodeURIComponent(localidade)}&state=${encodeURIComponent(uf)}&country=Brazil&limit=1`,
        );

        if (!nominatimResponse.ok) {
          throw new Error("Houve um erro ao buscar informações geográficas.");
        }
        const nominatimData = await nominatimResponse.json();

        if (!nominatimData || nominatimData.length === 0) {
          throw new Error(
            "Não foi possível encontrar as coordenadas geográficas para este endereço.",
          );
        }

        const { lat, lon } = nominatimData[0];

        handler((prev) => ({
          ...prev,
          cep: cep.replace("-", ""),
          logradouro,
          bairro,
          localidade,
          uf,
          lat: Number(lat),
          lon: Number(lon),
        }));
      } catch (error) {
        const message =
          (error instanceof Error && error.message) ||
          "Um erro inesperado ocorreu.";
        toast.add({ description: message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editing, cepInput, handler]);

  const handleCepChange = (e) => setCepInput(mascaraCep(e.target.value));

  const handleKmChange = (e) =>
    handler((prev) => ({ ...prev, km: e.target.value }));

  const handleSentidoChange = (value) =>
    handler((prev) => ({ ...prev, sentido: value }));

  const handleLogradouroChange = (e) =>
    handler((prev) => ({ ...prev, logradouro: e.target.value }));

  const handleBairroChange = (e) =>
    handler((prev) => ({ ...prev, bairro: e.target.value }));

  const handleLocalidadeChange = (e) =>
    handler((prev) => ({ ...prev, localidade: e.target.value }));

  const handleComplementoChange = (e) =>
    handler((prev) => ({ ...prev, complemento: e.target.value }));

  const handleUfChange = (value) => handler((prev) => ({ ...prev, uf: value }));

  const handleNumeroChange = (e) =>
    handler((prev) => ({ ...prev, numero: e.target.value ?? "S/N" }));

  return (
    <FieldSet className="min-w-0">
      <FieldLegend>Endereço</FieldLegend>
      <FieldDescription>
        A localização física do pórtico onde o embarcado está instalado.
      </FieldDescription>

      <FieldGroup className="grid grid-cols-6 gap-4">
        {/* Campo - CEP */}
        <Field className="col-span-4">
          <FieldLabel htmlFor="embarcado-cep">
            CEP<span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Input
            id="embarcado-cep"
            type="text"
            value={cepInput}
            onChange={handleCepChange}
            minLength={9}
            maxLength={9}
            placeholder="00000-000"
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - Número */}
        <Field className="col-span-2">
          <FieldLabel htmlFor="embarcado-numero">Número</FieldLabel>
          <Input
            id="embarcado-numero"
            type="text"
            value={fields.numero}
            onChange={handleNumeroChange}
            placeholder="000"
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - Km */}
        <Field className="col-span-4">
          <FieldLabel htmlFor="embarcado-km">
            Km<span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Input
            id="embarcado-km"
            type="number"
            value={fields.km}
            onChange={handleKmChange}
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - Sentido */}
        <Field className="col-span-2">
          <FieldLabel htmlFor="embarcado-sentido">
            Sentido<span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Select
            id="embarcado-sentido"
            items={SENTIDOS}
            value={fields.sentido}
            onValueChange={handleSentidoChange}
            disabled={isLoading || editing}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SENTIDOS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {/* Campo - Logradouro */}
        <Field className="col-span-6">
          <FieldLabel htmlFor="embarcado-logradouro">Logradouro</FieldLabel>
          <Input
            id="embarcado-logradouro"
            type="text"
            value={fields.logradouro}
            onChange={handleLogradouroChange}
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - Bairro */}
        <Field className="col-span-6">
          <FieldLabel htmlFor="embarcado-bairro">Bairro</FieldLabel>
          <Input
            id="embarcado-bairro"
            type="text"
            value={fields.bairro}
            onChange={handleBairroChange}
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - Complemento */}
        <Field className="col-span-6">
          <FieldLabel htmlFor="embarcado-complemento">Complemento</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="embarcado-complemento"
              type="text"
              value={fields.complemento}
              onChange={handleComplementoChange}
              maxLength={MAX_CHARACTERS_COMPLEMENTO}
              disabled={isLoading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                {fields.complemento?.length}/{MAX_CHARACTERS_COMPLEMENTO}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {/* Campo - Localidade */}
        <Field className="col-span-4">
          <FieldLabel htmlFor="embarcado-localidade">
            Localidade<span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Input
            id="embarcado-localidade"
            type="text"
            value={fields.localidade}
            onChange={handleLocalidadeChange}
            disabled={isLoading || editing}
            required
          />
        </Field>
        {/* Campo - UF */}
        <Field className="col-span-2">
          <FieldLabel htmlFor="embarcado-uf">
            UF<span className="text-destructive font-bold">*</span>
          </FieldLabel>
          <Select
            id="embarcado-uf"
            items={UF}
            value={fields.uf}
            onValueChange={handleUfChange}
            disabled={isLoading || editing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {UF.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
