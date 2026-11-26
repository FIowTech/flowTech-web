import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { useCallback, useEffect, useState } from "react";

const AUTO_REFRESH_MS = Number(import.meta.env.VITE_TRACES_REFRESH_MS ?? 300000);
const FETCH_LIMIT = Number(import.meta.env.VITE_TRACES_FETCH_LIMIT ?? 500);

export function useFetchTraces({
  enderecoMac,
  periodo = "1h",
  autoRefreshMs = AUTO_REFRESH_MS,
  fetchLimit = FETCH_LIMIT,
}) {
  const authToken = useAuth((state) => state.token);
  const [traces, setTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTraces = useCallback(async () => {
    if (!enderecoMac || !authToken) {
      setTraces([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`${import.meta.env.VITE_BASE_API_URL}/traces`);
      url.searchParams.set("endereco_mac", enderecoMac);
      url.searchParams.set("periodo", periodo);
      url.searchParams.set("limit", String(fetchLimit));
      url.searchParams.set("offset", "0");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível buscar traces.");
      }

      setTraces(data.result ?? []);
    } catch (err) {
      const message =
        (err instanceof Error && err.message) ||
        "Houve um erro ao buscar traces.";
      setError(message);
      toast.add({ description: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, enderecoMac, fetchLimit, periodo]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchTraces();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchTraces]);

  useEffect(() => {
    if (!enderecoMac || !authToken) return;

    const timerId = setInterval(() => {
      fetchTraces();
    }, autoRefreshMs);

    return () => clearInterval(timerId);
  }, [authToken, autoRefreshMs, enderecoMac, fetchTraces]);

  return { traces, isLoading, error, refetch: fetchTraces };
}
