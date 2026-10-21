import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchUsuarios = (empresaID) => {
  const {
    resource: usuarios,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource(`usuarios/${empresaID}`);

  return { usuarios, isLoading, error, refetch };
};