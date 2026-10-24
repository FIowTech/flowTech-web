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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";



// Data de hoje no formato yyyy-mm-dd (usado como mínimo do input de data)
const hojeISO = () => new Date().toISOString().split("T")[0];

export function MembroCreateForm({ empresaId, onSuccess }) {
  const authToken = useAuth((state) => state.token);
  const usuario = useAuth((state) => state.usuario);

  const [open, setOpen] = useState(false);
  const [isSendingForm, setIsSendingForm] = useState(false);

  const [convite, setConvite] = useState({
    qtd_usos_max: 1,
    data_expiracao: "",
  });
  const isFormValid =
    Number.isInteger(convite.qtd_usos_max) &&
    convite.qtd_usos_max >= 1 &&
    convite.data_expiracao !== "" &&
    convite.data_expiracao >= hojeISO();

  const handleQtdUsosChange = (e) =>
    setConvite((prev) => ({ ...prev, qtd_usos_max: Number(e.target.value) }));

  const handleDataExpiracaoChange = (e) =>
    setConvite((prev) => ({ ...prev, data_expiracao: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSendingForm(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          // O "codigo" é gerado pelo backend (garante que seja único)
          body: JSON.stringify({
            id_usuario: usuario?.id,
            empresa_id: empresaId,
            qtd_usos_max: convite.qtd_usos_max,
            data_expiracao: convite.data_expiracao,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.add({ description: data.message, type: "success" });
      setConvite({ qtd_usos_max: 1, data_expiracao: "" });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        "Houve um erro ao criar o código.";
      toast.add({ description: message, type: "error" });
    } finally {
      setIsSendingForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className="flex items-center gap-2 cursor-pointer"
          >
            Convidar Membro
            <PlusIcon />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90vh] no-scrollbar overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar código de convite</DialogTitle>
          <DialogDescription>
            O código será gerado automaticamente. O compartilhamento fica por
            conta dos funcionários.
          </DialogDescription>
        </DialogHeader>

        <form
          id="criar-convite-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
        >
          <FieldSet className="min-w-0">
            <FieldLegend>Dados do código</FieldLegend>
            <FieldDescription>
              Defina quantas vezes o código pode ser usado e até quando ele vale.
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="criar-convite-usos">
                  Quantidade máxima de usos{" "}
                  <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="criar-convite-usos"
                  className="max-w-xs"
                  type="number"
                  min={1}
                  value={convite.qtd_usos_max}
                  onChange={handleQtdUsosChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="criar-convite-expiracao">
                  Data de expiração{" "}
                  <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="criar-convite-expiracao"
                  className="max-w-xs"
                  type="date"
                  min={hojeISO()}
                  value={convite.data_expiracao}
                  onChange={handleDataExpiracaoChange}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="criar-convite-form"
            disabled={isSendingForm || !isFormValid}
          >
            {isSendingForm ? (
              <span className="flex items-center space-x-2">
                <Spinner /> Criando
              </span>
            ) : (
              "Criar código"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}