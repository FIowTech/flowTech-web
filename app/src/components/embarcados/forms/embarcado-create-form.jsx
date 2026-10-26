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
import { useFetchComponentes } from "@/hooks/useFetchComponentes";
import { useAuth } from "@/store/auth-store";
import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ComponentesMonitoradosFields } from "./componentes-monitorados-fields";
import { EnderecoFields } from "./endereco-fields";
import { InformacoesGeraisFields } from "./informacoes-gerais-fields";

export function EmbarcadoCreateForm() {
  const authToken = useAuth((state) => state.token);
  const { componentes, isLoading } = useFetchComponentes();

  const [isSendingForm, setIsSendingForm] = useState(false);

  const [informacoesGerais, setInformacoesGerais] = useState({
    endereco_mac: "",
    modelo: "",
    apelido: "",
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
    numero: "S/N",
    complemento: "",
    km: "",
    sentido: "",
    lat: null,
    lon: null,
  });

  const [componentesMonitorados, setComponentesMonitorados] = useState([]);
  useEffect(() => {
    const a = () => {
      setComponentesMonitorados(
        componentes.map((c) => ({
          ...c,
          status: 0,
          limite_max: 0.0,
          limite_min: 0.0,
        })),
      );
    };

    a();
  }, [componentes]);

  const isInformacoesGeraisValid = true;

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

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="flex items-center gap-2 cursor-pointer">
            <PlusIcon />
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
              editing={false}
            />
            <EnderecoFields
              fields={endereco}
              handler={setEndereco}
              editing={false}
            />
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
