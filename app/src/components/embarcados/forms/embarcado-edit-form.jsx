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
import { useEffect, useState } from "react";
import { ComponentesMonitoradosFields } from "./componentes-monitorados-fields";
import { EnderecoFields } from "./endereco-fields";
import { InformacoesGeraisFields } from "./informacoes-gerais-fields";

export function EmbarcadoEditForm({ embarcado }) {
  const authToken = useAuth((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const [isSendingForm, setIsSendingForm] = useState(false);

  const [informacoesGerais, setInformacoesGerais] = useState({
    endereco_mac: embarcado.endereco_mac,
    modelo: embarcado.modelo,
    apelido: embarcado.apelido,
  });

  const [endereco, setEndereco] = useState(embarcado.endereco);

  const [componentesMonitorados, setComponentesMonitorados] = useState(
    embarcado.parametros,
  );

  const isInformacoesGeraisValid = true;
  // const isInformacoesGeraisValid =
  //   informacoesGerais.endereco_mac.length === 17 &&
  //   informacoesGerais.apelido.length > 0 &&
  //   informacoesGerais.modelo.length > 0;

  const isEnderecoValid = Object.entries(endereco)
    .filter((entry) => entry[0] !== "complemento")
    .every((entry) => entry[1] !== null);

  const isComponentesMonitoradosValid = componentesMonitorados.some(
    (c) => c.status === 1,
  );

  const isFormValid =
    isInformacoesGeraisValid &&
    isEnderecoValid &&
    isComponentesMonitoradosValid;

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
      const fields = {
        ...informacoesGerais,
        endereco,
        componentes: Object.fromEntries(componentesMap),
      };
      console.log(fields);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/embarcados/cadastrar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ ...fields }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.add({ description: data.message, type: "success" });
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        "Houve um error ao cadastrar o Embarcado.";
      toast.add({ description: message, type: "error" });
    } finally {
      setIsSendingForm(false);
    }
  };

  useEffect(() => {
    const carregarRecursos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/componentes`,
          { method: "GET", headers: { Authorization: `Bearer ${authToken}` } },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message ||
              "Não foi possível carregar a lista de componentes monitóraveis",
          );
        }

        const componentes = data.result.map((c) => ({
          ...c,
          status: 0,
          limite_max: 0.0,
          limite_min: 0.0,
        }));
        setComponentesMonitorados(componentes);
      } catch (error) {
        const message =
          (error instanceof Error && error.message) ||
          "Houve um error ao buscar recursos.";

        toast.add({
          description: message,
          type: error,
        });
      } finally {
        setIsLoading(false);
      }
    };

    carregarRecursos();
  }, [authToken]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="flex items-center gap-2 cursor-pointer">
            <PencilSimpleLineIcon />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-5xl max-h-[90vh] no-scrollbar overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro de Embarcado</DialogTitle>
          <DialogDescription>
            Todos os membros da sua equipe poderão ver o embarcado que você
            cadastrar.
          </DialogDescription>
        </DialogHeader>

        <form
          id="criar-embarcado-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <InformacoesGeraisFields
              fields={informacoesGerais}
              handler={setInformacoesGerais}
            />
            <EnderecoFields fields={endereco} handler={setEndereco} />
          </div>

          {!isLoading && componentesMonitorados && (
            <ComponentesMonitoradosFields
              fields={componentesMonitorados}
              handler={setComponentesMonitorados}
            />
          )}
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="criar-embarcado-form"
            disabled={isSendingForm || !isFormValid}
          >
            {isSendingForm ? (
              <span className="flex items-center space-x-2">
                <Spinner /> Cadastrando
              </span>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
