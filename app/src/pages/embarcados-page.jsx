import { EmbarcadosList } from "@/components/embarcados/embarcados-list";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowsCounterClockwiseIcon, PlusIcon } from "@phosphor-icons/react";

// Variáveis mockadas e temporárias
const tempEmpresaRazaoSocial = "%Razao_Social%";
const tempEmbarcados = [
  {
    enderecoMac: "1A:2B:3C:4D:5E:6F",
    apelido: "SRV-001",
    modelo: "PADR-SR1980",
    status: "controlado",
  },
  {
    enderecoMac: "7A:8B:9C:0D:1E:2F",
    apelido: "SRV-002",
    modelo: "PADR-SR1980",
    status: "atencao",
  },
  {
    enderecoMac: "3A:4B:5C:6D:7E:8F",
    apelido: "SRV-003",
    modelo: "PADR-SR1980",
    status: "critico",
  },
];

export default function EmbarcadosPage() {
  const handleRefetch = () => {
    console.log("atualizando lista de embarcados...");
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <Card className="bg-background flex-row items-center justify-between px-4">
        <div>
          <h2 className="block text-xs text-muted-foreground">Embarcados de</h2>
          <h1 className="font-heading text-xl font-semibold">
            {tempEmpresaRazaoSocial}
          </h1>
        </div>

        <Relogio />
      </Card>

      {/* Lista de Embarcados */}
      <div className="bg-background p-4 flex flex-col space-y-6 rounded-md border-2 border-border">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Embarcados encontrados (
            <span className="text-primary-hover font-heading font-semibold">
              {tempEmbarcados.length}
            </span>
            )
          </h2>

          <div className="flex items-center gap-1">
            <Button className="flex items-center gap-2 cursor-pointer">
              <PlusIcon />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowsCounterClockwiseIcon />
            </Button>
          </div>
        </div>
        <EmbarcadosList embarcados={tempEmbarcados} refetch={handleRefetch} />
      </div>
    </div>
  );
}
