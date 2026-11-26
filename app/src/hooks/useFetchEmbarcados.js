import { useMemo } from "react";
import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchEmbarcados = () => {
  const { resource: embarcados, isLoading, error, refetch: refetchEmb } =
    useFetchProtectedResource("embarcados");
  const { resource: resumo, refetch: refetchGold } =
    useFetchProtectedResource("gold/resumo");

  const lista = useMemo(() => {
    const porId = new Map((resumo?.servidores ?? []).map((s) => [s.id_embarcado, s]));
    return (embarcados ?? []).map((e) => {
      const g = porId.get(e.id_embarcado);

      // nivel do gold: 'normal' | 'alerta' | 'critico' | 'sem_dados'
      const nivel = g?.nivel ?? null;

      // status_front é o formato string que o frontend espera: controlado/alerta/critico/sem_dados
      const status_front = nivel === "normal"
        ? "controlado"
        : nivel === "alerta"
        ? "alerta"
        : nivel === "critico"
        ? "critico"
        : "sem_dados";

      return {
        ...e,
        // mantém status numérico vindo do gold (se houver)
        status: g?.status ?? e.status ?? null,
        nivel,
        status_front,
        alertas: g?.alertas ?? [],
        ultima_leitura: g?.ultima_leitura ?? null,
        recente: g?.recente ?? false,
        disponivel: g?.disponivel ?? null,
        disponibilidade_percent: g?.disponibilidade_percent ?? null,
      };
    });
  }, [embarcados, resumo]);

  const refetch = () => { refetchEmb(); refetchGold(); };
  return { embarcados: lista, resumo, isLoading, error, refetch };
};
