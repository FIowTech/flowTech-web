import { ProhibitIcon } from "@phosphor-icons/react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

export function CodigoCard({ codigo }) {
  const dataCriacao = codigo.data_criacao.split("T")[0].replaceAll("-", "/");
  const dataExpiracao = codigo.data_expiracao
    .split("T")[0]
    .replaceAll("-", "/");

  return (
    <Card size="sm">
      <CardContent className="p-2 flex flex-row flex-wrap space-x-2 space-y-2">
        <Badge>Codigo: {codigo.codigo}</Badge>
        <Badge variant="outline">
          Usos: {codigo.qtd_usos} / {codigo.qtd_usos_max}
        </Badge>
        <Badge variant="outline">Criado em: {dataCriacao}</Badge>
        <Badge variant="outline">Expira em: {dataExpiracao}</Badge>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="text-xs">
          Criado por <span className="font-bold">{codigo.criador}</span> •
          Encontra-se <span className="font-bold">{codigo.status}</span>
        </div>

        <Button
          type="button"
          variant="destructive"
          className="text-xs cursor-pointer border-destructive"
        >
          Revogar
          <ProhibitIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
