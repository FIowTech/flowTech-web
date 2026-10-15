import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export function ServidorDetalhes({ servidor }) {
  if (!servidor) {
    return (
      <Card size="sm" className="w-full bg-background lg:w-72">
        <CardContent className="text-sm text-muted-foreground">
          Selecione um servidor no mapa para ver os detalhes.
        </CardContent>
      </Card>
    );
  }

  const { endereco, sistema } = servidor;

  return (
    <Card size="sm" className="w-full bg-background lg:w-72">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          Informações de:
          <Valor>{servidor.apelido}</Valor>
        </div>

        <Secao titulo="Detalhes">
          <Linha label="MAC:" valor={servidor.endereco_mac} />
          <Linha label="Modelo:" valor={servidor.modelo} />
        </Secao>

        <Secao titulo="Localização">
          <Linha label="CEP:" valor={endereco.cep} />
          <Linha
            label="Localidade:"
            valor={`${endereco.localidade} - ${endereco.uf}`}
          />
          <Linha
            label="Km/Sentido:"
            valor={`${endereco.km} / ${endereco.sentido}`}
          />
        </Secao>

        <Secao titulo="Especificações de Sistema">
          <Linha label="CPU - Núcleos:" valor={sistema.cpu} />
          <Linha label="RAM:" valor={sistema.ram} />
          <Linha label="Disco:" valor={sistema.disco} />
        </Secao>
      </CardContent>
    </Card>
  );
}

function Secao({ titulo, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="border-b pb-1 text-xs font-bold text-foreground">
        {titulo}
      </h3>

      {children}
    </div>
  );
}

function Linha({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      {label}
      <Valor>{valor}</Valor>
    </div>
  );
}

function Valor({ children }) {
  return (
    <Badge
      variant="secondary"
      className="h-auto rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
    >
      {children}
    </Badge>
  );
}
