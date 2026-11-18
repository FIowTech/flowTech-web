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
      return { ...e, status: g?.status ?? null, alertas: g?.alertas ?? [], ultima_leitura: g?.ultima_leitura ?? null };
    });
  }, [embarcados, resumo]);

  const refetch = () => { refetchEmb(); refetchGold(); };
  return { embarcados: lista, resumo, isLoading, error, refetch };
};