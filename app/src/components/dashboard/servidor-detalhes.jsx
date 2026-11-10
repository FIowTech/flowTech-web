import { mascaraCep } from "@/utils/mascaras";
import { useNavigate } from "react-router";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowRightIcon } from "@phosphor-icons/react";

// Variável mockada e temporária
// TODO: trocar quando a API passar a devolver CPU, RAM e disco do embarcado
const tempSistema = { cpu: "24 físicos", ram: "128 GiB", disco: "8 TB" };

export function ServidorDetalhes({ servidor }) {
  const navigate = useNavigate();

  if (!servidor) {
    return (
      <Card size="sm" className="w-full bg-background lg:w-72">
        <CardContent className="text-sm text-muted-foreground">
          Selecione um servidor no mapa para ver os detalhes.
        </CardContent>
      </Card>
    );
  }

  const endereco = servidor.endereco ?? {};
  // CPU, RAM e disco ainda não existem na API: usa o mock até ela devolver
  const sistema = servidor.sistema ?? tempSistema;

  // Leva para a página do servidor (rota /embarcados/:id)
  const handleVerDashboardClick = () => {
    navigate("/embarcados?id=" + servidor.id_embarcado);
  };

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
          <Linha label="CEP:" valor={endereco.cep && mascaraCep(endereco.cep)} />
          <Linha
            label="Localidade:"
            valor={juntar(endereco.localidade, endereco.uf, " - ")}
          />
          <Linha
            label="Km/Sentido:"
            valor={juntar(endereco.km, endereco.sentido, " / ")}
          />
        </Secao>

        <Secao titulo="Especificações de Sistema">
          <Linha label="CPU - Núcleos:" valor={sistema.cpu} />
          <Linha label="RAM:" valor={sistema.ram} />
          <Linha label="Disco:" valor={sistema.disco} />
        </Secao>

        <Secao titulo="Informação de Conexão">
          <Linha label="Última conexão:" valor={sistema.cpu} />
          <Linha label="IP:" valor={sistema.ram} />
          <Linha label="Disponibilidade:" valor={sistema.disco} />
        </Secao>

        <Secao titulo="Resumo de Recursos">
          <Linha label="CPU:" valor={sistema.cpu} />
          <Linha label="RAM:" valor={sistema.ram} />
          <Linha label="Alertas ativos:" valor={sistema.disco} />
        </Secao>

      <Button
        type="button"
        size="sm"
        className="group self-end gap-1.5 rounded-md px-4 font-semibold shadow-sm shadow-primary/30 transition-all hover:shadow-md hover:shadow-primary/40"
        onClick={handleVerDashboardClick}
      >
        Ver dashboard
        <ArrowRightIcon
          weight="bold"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Button>
      </CardContent>
    </Card>
  );
}

function juntar(a, b, separador) {
  return a && b ? a + separador + b : null;
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
      <Valor>{valor || "—"}</Valor>
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
