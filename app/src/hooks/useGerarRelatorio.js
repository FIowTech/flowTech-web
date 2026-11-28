import { toast } from "@/components/ui/toast";
import { useState } from "react";

const NOME_ARQUIVO_PADRAO = "relatorio-embarcado.pdf";

function obterNomeArquivo(contentDisposition) {
  const nome = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return nome?.trim() || NOME_ARQUIVO_PADRAO;
}

export function useGerarRelatorio() {
  const [isLoading, setIsLoading] = useState(false);

  const gerarRelatorio = async (apelido) => {
    setIsLoading(true);

    try {
      const endpoint = new URL(import.meta.env.VITE_JAVA_SERVER);

      if (apelido) {
        endpoint.searchParams.set("apelido", apelido);
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Não foi possível gerar o relatório.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = obterNomeArquivo(
        response.headers.get("content-disposition"),
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Alguns navegadores cancelam o download se a URL for revogada na hora.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.add({
        description: "Relatório baixado com sucesso.",
        type: "success",
      });
    } catch (error) {
      toast.add({
        description:
          (error instanceof Error && error.message) ||
          "Não foi possível baixar o relatório.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { gerarRelatorio, isLoading };
}
