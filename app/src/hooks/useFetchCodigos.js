import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchCodigos = () => {
  const {
    resource: codigos,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("codigos");

  return { codigos: codigos ?? [], isLoading, error, refetch };
};
