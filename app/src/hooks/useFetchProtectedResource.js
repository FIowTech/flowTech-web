import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { useEffect, useState } from "react";

export const useFetchProtectedResource = (endpoint) => {
  const authToken = useAuth((state) => state.token);
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const refetch = () => setRefetchTrigger(0);

  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!authToken) throw new Error("Usuário não está logado.");

        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/${endpoint}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Não foi possível buscar o recurso.");
        }
        setResource(data.result);
      } catch (error) {
        const message =
          (error instanceof Error && error.message) ||
          "Houve um error ao buscar o recurso.";
        setError(message);
        toast.add({ description: message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [authToken, endpoint, refetchTrigger]);

  return { resource, isLoading, error, refetch };
};
