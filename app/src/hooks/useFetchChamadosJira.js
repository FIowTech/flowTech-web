import { useFetchProtectedResource } from "./useFetchProtectedResource";

export const useFetchChamadosJira = () => {
  const {
    resource: chamadosJira,
    isLoading,
    error,
    refetch,
  } = useFetchProtectedResource("dashboard/jira/chamados-responsaveis");

  console.log("Dados recebidos do backend:", chamadosJira);

  return {
    dados: chamadosJira?.dados ?? [],
    totalChamados: chamadosJira?.totalChamados ?? 0,
    isLoading,
    error,
    refetch,
  };
};