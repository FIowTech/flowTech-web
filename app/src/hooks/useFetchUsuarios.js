import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchUsuarios = () => {
  const {
    resource: usuarios,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("usuarios");

  return { usuarios: usuarios ?? [], isLoading, error, refetch };
};