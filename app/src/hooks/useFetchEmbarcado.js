import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchEmbarcado = (idEmbarcado) => {
  const {
    resource: embarcado,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource(`embarcados/${idEmbarcado}`);

  console.log(embarcado);
  return { embarcado, isLoading, error, refetch };
};
