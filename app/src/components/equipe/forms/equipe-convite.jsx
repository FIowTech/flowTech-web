import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";


const CARGOS = ["Administrador", "Usuario",];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.])[A-Za-z\d@$!%*?&#.]{8,}$/;

export function MembroCreateForm({ onSuccess }) {
  const authToken = useAuth((state) => state.token);

  const [open, setOpen] = useState(false);
  const [isSendingForm, setIsSendingForm] = useState(false);

  const [membro, setMembro] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "",
  });

  const isFormValid =
    membro.nome.trim().length > 0 &&
    emailRegex.test(membro.email) &&
    senhaRegex.test(membro.senha) &&
    membro.cargo !== "";

  const handleChange = (campo) => (e) =>
    setMembro((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleCargoChange = (value) =>
    setMembro((prev) => ({ ...prev, cargo: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSendingForm(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/usuarios/convidar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(membro),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.add({ description: data.message, type: "success" });
      setMembro({ nome: "", email: "", cargo: "" });
      setOpen(false);
      onSuccess?.(); 
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        "Houve um erro ao adicionar o membro.";
      toast.add({ description: message, type: "error" });
    } finally {
      setIsSendingForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="flex items-center gap-2 cursor-pointer">
            <PlusIcon />
            Adicionar membro
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90vh] no-scrollbar overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar membro</DialogTitle>
          <DialogDescription>
            O membro receberá um convite para participar da sua equipe.
          </DialogDescription>
        </DialogHeader>

        <form
          id="criar-membro-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
        >
          <FieldSet className="min-w-0">
            <FieldLegend>Dados do membro</FieldLegend>
            <FieldDescription>
              Use o e-mail que a pessoa utilizará para acessar o sistema.
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="criar-membro-nome">
                  Nome <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="criar-membro-nome"
                  type="text"
                  placeholder="Maria Silva"
                  value={membro.nome}
                  onChange={handleChange("nome")}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="criar-membro-email">
                  E-mail <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="criar-membro-email"
                  type="email"
                  placeholder="maria@empresa.com"
                  value={membro.email}
                  onChange={handleChange("email")}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="criar-membro-cargo">
                  Cargo <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Select
                  id="criar-membro-cargo"
                  items={CARGOS}
                  value={membro.cargo}
                  onValueChange={handleCargoChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CARGOS.map((item) => (
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
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="criar-membro-form"
            disabled={isSendingForm || !isFormValid}
          >
            {isSendingForm ? (
              <span className="flex items-center space-x-2">
                <Spinner /> Adicionando
              </span>
            ) : (
              "Adicionar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}