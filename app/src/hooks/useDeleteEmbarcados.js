import { useState } from "react";
import { useAuth } from "@/store/auth-store";

export function useDeleteEmbarcado() {
  const token = useAuth((state) => state.token);

  const [isDeleting, setIsDeleting] = useState(false);

  async function deletarEmbarcado(idEmbarcado) {
    try {
      setIsDeleting(true);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/embarcados/${idEmbarcado}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar servidor.");
      }

      return true;
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    deletarEmbarcado,
    isDeleting,
  };
}