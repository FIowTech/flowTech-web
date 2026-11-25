import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchJiraEquipe = () => {
  const {
    resource,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("jira/chamados-equipe");

  const resultado = resource?.result ?? resource;

  return {
    labels: resultado?.labels ?? [],
    valores: resultado?.valores ?? [],
    integrantes: resultado?.integrantes ?? [],
    total: resultado?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
};