import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchComponentes = () => {
  const {
    resource: componentes,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("componentes");

  return { componentes: componentes ?? [], isLoading, error, refetch };
};
