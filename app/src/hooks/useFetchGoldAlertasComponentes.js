import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchGoldAlertasComponentes = (
  periodo,
  embarcadoId,
) => {
  const endpoint =
    `gold/alertas-componentes?` +
    `periodo=${encodeURIComponent(periodo)}` +
    `&embarcadoId=${encodeURIComponent(embarcadoId)}`;

  const {
    resource,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource(endpoint);

  // A API retorna os dados dentro de "result"
  const resultado = resource?.result ?? resource;

  return {
    dados: resultado ?? null,
    componentes: resultado?.componentes ?? [],
    totalAlertas: resultado?.total_alertas ?? 0,
    isLoading,
    error,
    refetch,
  };
};
