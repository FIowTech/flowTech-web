import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth-store";

const RESUMO_VAZIO = {
  total: "0",
  comerciais: "0",
  passeios: "0",
  motos: "0",
  maiorPortico: "-",
  cobertura: "100%",
};

const API_URL = import.meta.env.VITE_BASE_API_URL;

export function useFetchGoldExposicao(periodo = "mes-atual") {
  const token = useAuth((state) => state.token);

  const [resumo, setResumo] = useState(RESUMO_VAZIO);
  const [ranking, setRanking] = useState([]);
  const [hardwarePorPortico, setHardwarePorPortico] = useState({});
  const [evolucaoPorPortico, setEvolucaoPorPortico] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchExposicao() {
      setIsLoading(true);
      setError(null);

      try {
        const resposta = await fetch(
          `${API_URL}/gold/exposicao?periodo=${encodeURIComponent(periodo)}`,
          {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const contentType = resposta.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("A rota /api/gold/exposicao não retornou JSON.");
        }

        const payload = await resposta.json();

        if (!resposta.ok) {
          throw new Error(payload.message || `Erro (${resposta.status})`);
        }

        const data = payload.result || {};

        setResumo(data.resumo ?? RESUMO_VAZIO);
        setRanking(data.ranking ?? []);
        setHardwarePorPortico(data.hardwarePorPortico ?? {});
        setEvolucaoPorPortico(data.evolucaoPorPortico ?? {});
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Erro ao carregar exposição.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchExposicao();

    return () => controller.abort();
  }, [periodo, token]);

  return {
    resumo,
    ranking,
    hardwarePorPortico,
    evolucaoPorPortico,
    isLoading,
    error,
  };
}