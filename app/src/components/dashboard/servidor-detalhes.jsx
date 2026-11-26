import { mascaraCep } from "@/utils/mascaras";
import { useNavigate } from "react-router";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { pegarStatusServidor } from "@/utils/status-servidor";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useFetchProtectedResource } from "@/hooks/useFetchProtectedResource";

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

        {/* Dados reais do Gold (conexão e recursos) */}
        <DadosGold id={servidor.id_embarcado} servidor={servidor} />

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
      {typeof valor === "string" || typeof valor === "number" ? (
        <Valor>{valor || "—"}</Valor>
      ) : (
        // permite passar um componente (ex: Badge) diretamente
        valor ?? <Valor>{"—"}</Valor>
      )}
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
function formatarLeitura(texto) {
  if (!texto) return null;
  const [data, hora] = texto.split(" "); // "2026-11-14 20:09:14"
  return data.split("-").reverse().join("/") + " " + (hora ?? "");
}

function DadosGold({ id, servidor }) {
  const { resource: gold, isLoading, error, refetch } = useFetchProtectedResource(`gold/embarcados/${id}`);

  // helper defensivo para extrair percentuais de diferentes formatos
  const buscarPct = (g, grupo, possiveis) => {
    const metricas = g?.componentes?.[grupo]?.metricas ?? {};
    for (const nome of possiveis) {
      const m = metricas[nome];
      if (!m) continue;
      const v = m.valor_pct ?? m.valor;
      if (v == null) continue;
      if (typeof v === "number") return `${v.toFixed(1)}%`;
      return String(v);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-destructive">Erro ao carregar dados do S3.</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={refetch}>Recarregar</Button>
        </div>
      </div>
    );
  }

  if (!gold || gold.nivel === "sem_dados") {
    return (
      <div className="text-xs text-muted-foreground">
        <Secao titulo="Informação de Conexão">
          <Linha label="IP:" valor={"—"} />
          <Linha label="Última leitura:" valor={"—"} />
          <Linha label="Disponibilidade:" valor={(
            <Badge variant="outline">{servidor?.recente ? "Disponível (sem S3)" : "—"}</Badge>
          )} />
        </Secao>

        <Secao titulo="Resumo de Recursos">
          <Linha label="CPU:" valor={"—"} />
          <Linha label="RAM:" valor={"—"} />
          <Linha label="Disco:" valor={"—"} />
          <Linha label="Alertas ativos:" valor={"0"} />
        </Secao>
      </div>
    );
  }

  return (
    <>
      <Secao titulo="Informação de Conexão">
        <Linha label="IP:" valor={gold?.ip} />
        <Linha label="Última leitura:" valor={formatarLeitura(gold?.ultima_leitura)} />
        {/* Disponibilidade: preferir gold.disponivel, senão calc por ultima_leitura, senão fallback servidor */}
        {(() => {
          const LIMITE_MIN = Number(import.meta.env.VITE_GOLD_JANELA_CAPTURA_MIN ?? 60);
          let disponivel = null;
          if (gold?.disponivel !== undefined && gold?.disponivel !== null) {
            disponivel = Boolean(gold.disponivel);
          } else if (gold?.ultima_leitura) {
            const diffMin = (Date.now() - new Date(gold.ultima_leitura).getTime()) / 60000;
            disponivel = diffMin <= LIMITE_MIN;
          } else {
            disponivel = null;
          }

          let texto = "—";
          let variante = "outline";

          if (disponivel === true) {
            texto = "Disponível";
            variante = "default";
          } else if (disponivel === false && gold?.ultima_leitura) {
            texto = "Desatualizado";
            variante = "secondary";
          } else {
            // fallback para servidor
            if (servidor?.recente) {
              texto = "Disponível (sem S3)";
              variante = "default";
            } else {
              const st = pegarStatusServidor(servidor);
              if (st === "controlado") {
                texto = "Provável disponível";
                variante = "default";
              } else if (st === "alerta") {
                texto = "Indisponível (alerta)";
                variante = "secondary";
              } else {
                texto = "Indisponível";
                variante = "destructive";
              }
            }
          }

          const pct = gold?.disponibilidade_percent ?? servidor?.disponibilidade_percent ?? null;

          // Exibe apenas a porcentagem (quando disponível) ou um texto curto de fallback,
          // mantendo o mesmo estilo dos outros campos.
          const display = pct != null ? `${pct}%` : texto;
          return <Linha label="Disponibilidade:" valor={display} />;
        })()}
      </Secao>

      <Secao titulo="Resumo de Recursos">
        <Linha label="CPU:" valor={buscarPct(gold, "cpu", ["cpu_uso_pct", "uso", "cpu_uso"])} />
        <Linha label="RAM:" valor={buscarPct(gold, "ram", ["ram_uso_pct", "uso"])} />
        <Linha label="Disco:" valor={buscarPct(gold, "disco", ["disco_uso_pct", "uso"])} />
        <Linha label="Alertas ativos:" valor={gold.alertas ? String(gold.alertas.length) : "0"} />
      </Secao>
    </>
  );
}
