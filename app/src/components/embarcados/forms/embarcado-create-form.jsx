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
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ComponentesMonitoradosField } from "./componentes-monitorados-fields";
import { EnderecoFields } from "./endereco-fields";
import { InformacoesGeraisFields } from "./informacoes-gerais-fields";

export function EmbarcadoCreateForm() {
  const [isLoading, setIsLoading] = useState(false);

  const [informacoesGerais, setInformacoesGerais] = useState({
    enderecoMac: "",
    modelo: "",
    apelido: "",
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
    complemento: "",
    km: "",
    sentido: "",
    lat: null,
    lon: null,
  });

  const [componentesMonitorados, setComponentesMonitorados] = useState({
    cpu: {
      id: 1,
      nome: "CPU",
      metricas: {
        uso: {
          id: 1,
          nome: "Uso",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "pct",
          monitorado: false,
        },
        frequencia: {
          id: 2,
          nome: "Frequência",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "pct",
          monitorado: false,
        },
      },
    },
    ram: {
      id: 2,
      nome: "Memória RAM",
      metricas: {
        uso: {
          id: 1,
          nome: "Uso",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "MiB",
          monitorado: false,
        },
      },
    },
    swap: {
      id: 3,
      nome: "Memória SWAP",
      metricas: {
        uso: {
          id: 1,
          nome: "Uso",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "MiB",
          monitorado: false,
        },
      },
    },
    disco: {
      id: 4,
      nome: "Armazenamento (Disco)",
      metricas: {
        uso: {
          id: 1,
          nome: "Uso",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "MiB",
          monitorado: false,
        },
      },
    },
    rede: {
      id: 5,
      nome: "Tráfego de Rede",
      metricas: {
        download: {
          id: 1,
          nome: "Velocidade de Download",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "Mbps",
          monitorado: false,
        },
        upload: {
          id: 2,
          nome: "Velocidade de Upload",
          limiteMax: 0.0,
          limiteMin: 0.0,
          unidadeMedida: "Mbps",
          monitorado: false,
        },
      },
    },
  });

  const isInformacoesGeraisValid =
    informacoesGerais.enderecoMac.length === 17 &&
    informacoesGerais.apelido.length > 0 &&
    informacoesGerais.modelo.length > 0;

  const isEnderecoValid = Object.entries(endereco)
    .filter((entry) => entry[0] !== "complemento")
    .every((entry) => entry[1] !== null);

  const isComponentesMonitoradosValid =
    Object.values(componentesMonitorados).length > 0;

  const isFormValid =
    isInformacoesGeraisValid &&
    isEnderecoValid &&
    isComponentesMonitoradosValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      console.log("HEYA!!!");
      console.log({
        ...informacoesGerais,
        endereco,
        componentes: componentesMonitorados,
      });
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        "Houve um error ao cadastrar o Embarcado.";
      toast.add({ description: message, type: "error" });
    } finally {
      setIsLoading(false);
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
            />
            <EnderecoFields fields={endereco} handler={setEndereco} />
          </div>

          <ComponentesMonitoradosField
            fields={componentesMonitorados}
            handler={setComponentesMonitorados}
          />
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="criar-embarcado-form"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
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
