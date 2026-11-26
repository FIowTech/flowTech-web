import { toast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth-store";
import { useCallback, useEffect, useState } from "react";

const AUTO_REFRESH_MS = Number(import.meta.env.VITE_LOGS_REFRESH_MS ?? 300000);
const FETCH_LIMIT = Number(import.meta.env.VITE_LOGS_FETCH_LIMIT ?? 500);

export function useFetchLogs({
  enderecoMac,
  periodo = "1h",
  autoRefreshMs = AUTO_REFRESH_MS,
  fetchLimit = FETCH_LIMIT,
}) {
  const authToken = useAuth((state) => state.token);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!enderecoMac || !authToken) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`${import.meta.env.VITE_BASE_API_URL}/logs`);
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
        throw new Error(data.message || "Não foi possível buscar logs.");
      }

      setLogs(data.result ?? []);
    } catch (err) {
      const message =
        (err instanceof Error && err.message) ||
        "Houve um erro ao buscar logs.";
      setError(message);
      toast.add({ description: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, enderecoMac, fetchLimit, periodo]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchLogs();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchLogs]);

  useEffect(() => {
    if (!enderecoMac || !authToken) return;

    const timerId = setInterval(() => {
      fetchLogs();
    }, autoRefreshMs);

    return () => clearInterval(timerId);
  }, [authToken, autoRefreshMs, enderecoMac, fetchLogs]);

  return { logs, isLoading, error, refetch: fetchLogs };
}
