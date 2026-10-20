import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmpresaStore } from "@/store/empresa-store";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function EmpresaField({ label, type, value, onChange, placeholder }) {
  return (
    <Field>
      <FieldLabel
        className="block text-[12.5px] font-bold text-text-primary mb-1.5"
        htmlFor={value}
      >
        {label}
      </FieldLabel>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-background-light"
      />
    </Field>
  );
}

export function RevisaoField({ label, text }) {
  return (
    <Field>
      <Label htmlFor={label}>{label}</Label>
      <Input type="text" value={text} disabled={true} />
    </Field>
  );
}

export function ButtonCadastrar() {
  const campos = useEmpresaStore((state) => state.campos);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando: ", campos);
  };

  return (
    <Button
      type="submit"
      onClick={handleSubmit}
      className="group cursor-pointer"
    >
      Cadastrar
      <ChevronRightIcon className="text-2xl transition-transform group-hover:translate-x-1" />
    </Button>
  );
}

export function ButtonProx() {
  const avancar = useEmpresaStore((state) => state.avancar);

  return (
    <Button onClick={avancar} className="group cursor-pointer">
      Continuar
      <ChevronRightIcon className="text-2xl transition-transform group-hover:translate-x-1" />
    </Button>
  );
}

export function ButtonVoltar() {
  const voltar = useEmpresaStore((state) => state.voltar);

  return (
    <Button onClick={voltar} variant="outline" className="group cursor-pointer">
      <ChevronLeftIcon className="text-2xl transition-transform group-hover:translate-x-1" />
      Voltar
    </Button>
  );
}
