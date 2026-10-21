import { EmbarcadosList } from "@/components/embarcados/embarcados-list";
import { EmbarcadoCreateForm } from "@/components/embarcados/forms/embarcado-create-form";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFetchEmbarcados } from "@/hooks/useFetchEmbarcados";
import { useFetchEmpresa } from "@/hooks/useFetchEmpresa";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";

export default function EmbarcadosPage() {
  const { empresa } = useFetchEmpresa();
  const {
    embarcados,
    isLoading: isLoadingEmbarcados,
    refetch,
  } = useFetchEmbarcados();

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Topbar */}
      <Card className="bg-background flex-row items-center justify-between px-4">
        <div>
          <h2 className="block text-xs text-muted-foreground">Embarcados de</h2>
          <h1 className="font-heading text-xl font-semibold">
            {empresa && empresa.razao_social}
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
              {embarcados.length}
            </span>
            )
          </h2>

          <div className="flex items-center gap-1">
            <EmbarcadoCreateForm />
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowsCounterClockwiseIcon />
            </Button>
          </div>
        </div>
        {isLoadingEmbarcados ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <EmbarcadosList embarcados={embarcados} refetchHandler={refetch} />
        )}
      </div>
    </div>
  );
}
