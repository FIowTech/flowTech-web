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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ComponentesMonitoradosFields } from "./componentes-monitorados-fields";
import { EnderecoFields } from "./endereco-fields";
import { InformacoesGeraisFields } from "./informacoes-gerais-fields";
import { useDeleteEmbarcado } from "@/hooks/useDeleteEmbarcados";

export function EmbarcadoEditForm({ embarcado, refetchHandler }) {
  const authToken = useAuth((state) => state.token);

  const [isSendingForm, setIsSendingForm] = useState(false);

  const { deletarEmbarcado, isDeleting } = useDeleteEmbarcado();
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const formId = `editar-embarcado-form-${embarcado.id_embarcado}`;

  async function handleDelete() {
    try {
      await deletarEmbarcado(embarcado.id_embarcado);

      toast.add({
        description: "Servidor deletado com sucesso!",
        type: "success",
      });

      setDialogAberto(false);

      if (refetchHandler) {
        await refetchHandler();
      }

    } catch (error) {
      toast.add({
        description: error.message || "Erro ao deletar servidor.",
        type: "error",
      });
    }
  }

  const [informacoesGerais, setInformacoesGerais] = useState({
    endereco_mac: embarcado.endereco_mac,
    modelo: embarcado.modelo,
    apelido: embarcado.apelido,
  });

  const [endereco, setEndereco] = useState(embarcado.endereco ?? {});

  const [componentesMonitorados, setComponentesMonitorados] = useState(
    embarcado.parametros,
  );

  const isInformacoesGeraisValid = true;

  const isComponentesMonitoradosValid = componentesMonitorados.some(
    (c) => c.status === 1,
  );

  const isFormValid = isInformacoesGeraisValid && isComponentesMonitoradosValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSendingForm(true);
    const componentesMap = new Map();
    componentesMonitorados
      .filter((c) => c.status === 1)
      .forEach((c) => {
        componentesMap.set(c.nome, c);
      });

    try {
      // Ensure endereco_mac and endereco are not changed by user but still
      // include the original values expected by backend in the payload.
      const { endereco_mac, ...informacoesSemMac } = informacoesGerais;
      const fields = {
        ...informacoesSemMac,
        endereco: embarcado.endereco ?? undefined,
        endereco_mac: embarcado.endereco_mac,
        componentes: Object.fromEntries(componentesMap),
      };
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/embarcados/${embarcado.id_embarcado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ ...fields }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível atualizar o embarcado.");
      }

      toast.add({ description: data.message, type: "success" });
      setDialogEditarAberto(false);
      await refetchHandler?.();
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        "Houve um erro ao atualizar o embarcado.";
      toast.add({ description: message, type: "error" });
    } finally {
      setIsSendingForm(false);
    }
  };

  return (
    <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
      <DialogTrigger
        render={
          <Button className="flex items-center gap-2 cursor-pointer">
            <PencilSimpleLineIcon />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-5xl max-h-[90vh] no-scrollbar overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar embarcado</DialogTitle>
          <DialogDescription>
            Atualize as informações do embarcado.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <InformacoesGeraisFields
              fields={informacoesGerais}
              handler={setInformacoesGerais}
              editing={true}
            />
            <EnderecoFields
              fields={endereco}
              handler={setEndereco}
              editing={true}
            />
          </div>

          <ComponentesMonitoradosFields
            fields={componentesMonitorados}
            handler={setComponentesMonitorados}
          />
        </form>

        <DialogFooter className="flex justify-between items-center">
          {/* Botão que aciona a abertura do Dialog de exclusão */}
          <Button
            variant="destructive"
            onClick={() => setDialogAberto(true)}
          >
            Deletar
          </Button>

          <div className="flex gap-2">
            <Button
              type="submit"
              form={formId}
              disabled={isSendingForm || !isFormValid}
            >
              {isSendingForm ? (
                <span className="flex items-center space-x-2">
                  <Spinner /> Salvando
                </span>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirmar exclusão?
            </DialogTitle>

            <DialogDescription>
              Tem certeza que deseja deletar este servidor?
              Essa ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center space-x-2">
                  <Spinner /> Deletando...
                </span>
              ) : (
                "Sim, deletar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
