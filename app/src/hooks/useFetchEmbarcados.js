import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchEmbarcados = () => {
  const {
    resource: embarcados,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("embarcados");

  return { embarcados: embarcados ?? [], isLoading, error, refetch };
};
