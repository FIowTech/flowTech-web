
import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchGoldResumo = () => {
  const {
    resource: resumo,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("gold/resumo");

  return {
    resumo: resumo ?? null,
    servidores: resumo?.servidores ?? [],
    totais: resumo?.totais ?? {
      controlado: 0,
      alerta: 0,
      critico: 0,
      sem_dados: 0,
      total: 0,
    },
    alertas: resumo?.alertas ?? {
      amarelo: 0,
      vermelho: 0,
      total: 0,
    },
    isLoading,
    error,
    refetch,
  };
};
