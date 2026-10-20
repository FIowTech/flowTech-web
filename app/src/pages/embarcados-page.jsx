import { EmbarcadosList } from "@/components/embarcados/embarcados-list";
import { EmbarcadoCreateForm } from "@/components/embarcados/forms/embarcado-create-form";
import { Relogio } from "@/components/relogio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function EmbarcadosPage() {
  const authToken = useAuth((state) => state.token);
  const [embarcados, setEmbarcados] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefetch = () => {
    console.log("atualizando lista de embarcados...");
  };

  useEffect(() => {
    const carregarRecursos = async () => {
      setIsLoading(true);

      try {
        // 1. Empresa do Usuário logado
        const responseEmpresa = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/empresas`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        const empresaData = await responseEmpresa.json();
        if (!responseEmpresa.ok) {
          throw new Error(
            empresaData.message ||
              "Não foi possível carregar os dados da Empresa",
          );
        }
        setEmpresa(empresaData.result);

        // 2. Lista de Embarcados
        const responseEmbarcados = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/embarcados`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        const embarcadosData = await responseEmbarcados.json();
        if (!responseEmbarcados.ok) {
          throw new Error(
            embarcadosData.message ||
              "Não foi possível carregar os dados dos Embarcados",
          );
        }
        setEmbarcados(embarcadosData.result);
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
        {!isLoading && embarcados.length > 0 && (
          <EmbarcadosList embarcados={embarcados} refetch={handleRefetch} />
        )}
      </div>
    </div>
  );
}
