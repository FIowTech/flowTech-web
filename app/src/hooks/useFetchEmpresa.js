import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchEmpresa = () => {
  const {
    resource: empresa,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("empresas");

  return { empresa, isLoading, error, refetch };
};
