import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { useCallback, useEffect, useState } from "react";

const AUTO_REFRESH_MS = Number(
  import.meta.env.VITE_ALERTAS_REFRESH_MS ?? 300000,
);
const FETCH_LIMIT = Number(import.meta.env.VITE_ALERTAS_FETCH_LIMIT ?? 500);

export function useFetchAlertas({
  periodo = "7d",
  situacao,
  autoRefreshMs = AUTO_REFRESH_MS,
  fetchLimit = FETCH_LIMIT,
} = {}) {
  const authToken = useAuth((state) => state.token);
  const [alertas, setAlertas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlertas = useCallback(async () => {
    if (!authToken) {
      setAlertas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`${import.meta.env.VITE_BASE_API_URL}/alertas`);
      url.searchParams.set("periodo", periodo);
      url.searchParams.set("limit", String(fetchLimit));
      url.searchParams.set("offset", "0");

      if (situacao) {
        url.searchParams.set("situacao", situacao);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível buscar alertas.");
      }

      setAlertas(data.result ?? []);
    } catch (err) {
      const message =
        (err instanceof Error && err.message) ||
        "Houve um erro ao buscar alertas.";
      setError(message);
      toast.add({ description: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, fetchLimit, periodo, situacao]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchAlertas();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchAlertas]);

  useEffect(() => {
    if (!authToken) return;

    const timerId = setInterval(() => {
      fetchAlertas();
    }, autoRefreshMs);

    return () => clearInterval(timerId);
  }, [authToken, autoRefreshMs, fetchAlertas]);

  return { alertas, isLoading, error, refetch: fetchAlertas };
}
