import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchEmbarcados = () => {
  const {
    resource: embarcados,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("embarcados");

  console.log(embarcados);
  return { embarcados: embarcados ?? [], isLoading, error, refetch };
};
