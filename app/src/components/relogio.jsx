import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function Relogio() {
  const gerarDataFormatada = () => {
    const date = new Date();

    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    const hora = String(date.getHours()).padStart(2, "0");
    const minuto = String(date.getMinutes()).padStart(2, "0");

    return `${ano}/${mes}/${dia} - ${hora}:${minuto}`;
  };

  const [now, setNow] = useState(gerarDataFormatada());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(gerarDataFormatada());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Badge variant="outline" className="bg-background-light rounded-md p-4">
      {now}
    </Badge>
  );
}
