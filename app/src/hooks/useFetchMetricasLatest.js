import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { useCallback, useEffect, useState } from "react";

const AUTO_REFRESH_MS = Number(import.meta.env.VITE_METRICAS_REFRESH_MS ?? 300000);

export function useFetchMetricasLatest(enderecoMac, autoRefreshMs = AUTO_REFRESH_MS) {
  const authToken = useAuth((state) => state.token);
  const [metricas, setMetricas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetricas = useCallback(async () => {
    if (!enderecoMac || !authToken) {
      setMetricas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`${import.meta.env.VITE_BASE_API_URL}/metricas`);
      url.searchParams.set("endereco_mac", enderecoMac);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível buscar métricas.");
      }

      setMetricas(data.result ?? []);
    } catch (err) {
      const message =
        (err instanceof Error && err.message) ||
        "Houve um erro ao buscar métricas.";
      setError(message);
      toast.add({ description: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, enderecoMac]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchMetricas();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchMetricas]);

  useEffect(() => {
    if (!enderecoMac || !authToken) return;

    const timerId = setInterval(() => {
      fetchMetricas();
    }, autoRefreshMs);

    return () => clearInterval(timerId);
  }, [authToken, autoRefreshMs, enderecoMac, fetchMetricas]);

  return { metricas, isLoading, error, refetch: fetchMetricas };
}
