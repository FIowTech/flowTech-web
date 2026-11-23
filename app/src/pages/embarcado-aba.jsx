import { GraficoLinha } from "@/components/dashboard/graficos";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ABAS = ["cpu", "ram", "disco", "rede"];

function ultimoValor(valores = []) {
  return [...valores].reverse().find((valor) => valor !== null && valor !== undefined);
}

function formatarValor(valor) {
  if (typeof valor !== "number") return valor ?? "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(valor);
}

function formatarComUnidade(valor, unidade) {
  return `${formatarValor(valor)}${unidade ? ` ${unidade}` : ""}`;
}

function formatarFrequencia(metrica) {
  if (!metrica) return "—";
  const valor = formatarComUnidade(metrica.valor, metrica.unidade_medida);
  const maximo =
    metrica.total !== null && metrica.total !== undefined
      ? ` / Max: ${formatarComUnidade(metrica.total, metrica.unidade_medida)}`
      : "";
  return `${valor}${maximo}`;
}

function CartaoKpi({ titulo, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className}`}>
      <h3 className="mb-1 text-sm font-medium text-muted-foreground">{titulo}</h3>
      {children}
    </div>
  );
}

export default function ModalDetalhesEmbarcado({
  servidor,
  isOpen,
  onClose,
  abaInicial = "cpu",
  metricas,
}) {
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);

  if (!isOpen || !servidor) return null;

  const metrica = metricas?.[abaAtiva];

  function renderizarDetalhes() {
    if (abaAtiva === "cpu") {
      const cpu = metrica.detalhes?.cpu;
      const frequenciaMetrica = cpu?.metricas?.freq;
      const frequencia = formatarFrequencia(frequenciaMetrica);
      const possuiNucleos = cpu?.qtd_nucleos_fisicos != null || cpu?.qtd_nucleos_logicos != null;
      const nucleosFisicos = cpu?.qtd_nucleos_fisicos ?? "—";
      const nucleosLogicos = cpu?.qtd_nucleos_logicos ?? "—";
      const possuiLoadAverage =
        cpu?.load_avg_1m != null || cpu?.load_avg_5m != null || cpu?.load_avg_15m != null;
      const loadAverage = possuiLoadAverage
        ? [cpu.load_avg_1m, cpu.load_avg_5m, cpu.load_avg_15m]
            .map((valor) => formatarValor(valor))
            .join(", ")
        : "—";
      const processoMetrica = cpu?.maior_processo;
      const processo = processoMetrica?.nome
        ? `${processoMetrica.nome} (${formatarComUnidade(processoMetrica.valor, processoMetrica.unidade_medida)})`
        : "—";

      return (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-12">
            <CartaoKpi titulo="Uso atual" className="md:col-span-3">
              <p className="text-3xl font-bold">
                {formatarValor(
                  metrica.linhas[0]?.atual ?? ultimoValor(metrica.linhas[0]?.valores),
                )}
                <span className="ml-1 text-lg font-medium">
                  {metrica.linhas[0]?.unidade || metrica.unidade || "%"}
                </span>
              </p>
            </CartaoKpi>
            <CartaoKpi titulo="Frequência do processador" className="md:col-span-5">
              <p className="text-xl font-bold">{formatarValor(frequencia)}</p>
            </CartaoKpi>
            <CartaoKpi
              titulo={`Núcleos${!possuiNucleos ? " (indisponível)" : ""}`}
              className="md:col-span-4"
            >
              <p className="text-sm font-semibold">
                {formatarValor(nucleosFisicos)} Físicos / {formatarValor(nucleosLogicos)} Lógicos
              </p>
            </CartaoKpi>
            <CartaoKpi
              titulo={`Load average (1m, 5m, 15m)${!possuiLoadAverage ? " (indisponível)" : ""}`}
              className="md:col-span-7"
            >
              <p className="font-mono text-2xl font-bold">{formatarValor(loadAverage)}</p>
            </CartaoKpi>
            <CartaoKpi
              titulo={`Maior processo (CPU)${!processoMetrica?.nome ? " (indisponível)" : ""}`}
              className="md:col-span-5"
            >
              <p className="font-mono text-sm font-semibold text-primary">
                {formatarValor(processo)}
              </p>
            </CartaoKpi>
          </div>
          <div className="relative h-72 rounded-lg border border-border bg-card p-4 md:h-80">
            <GraficoLinha
              labels={metrica.labels}
              linhas={metrica.linhas}
              unidade={metrica.unidade}
              max={metrica.max}
              area
              limiteMax={metrica.limiteMax}
              limiteMin={metrica.limiteMin}
            />
          </div>
        </div>
      );
    }

    if (abaAtiva === "ram") {
      const ram = metrica.detalhes?.ram;
      const swap = metrica.detalhes?.swap?.metricas?.uso;
      const usoRam = ram?.metricas?.uso;
      const memoriaPrincipal = usoRam
        ? `${formatarComUnidade(usoRam.valor, usoRam.unidade_medida)} / ${formatarComUnidade(usoRam.total, usoRam.unidade_medida)}`
        : "—";
      const percentual = usoRam?.valor_pct != null
        ? `${formatarComUnidade(usoRam.valor_pct, "%")} de utilização atual`
        : "Percentual indisponível";
      const processoMetrica = ram?.maior_processo;
      const processo = processoMetrica?.nome
        ? `${processoMetrica.nome} (${formatarComUnidade(processoMetrica.valor, processoMetrica.unidade_medida)})`
        : "—";

      return (
        <div className="grid gap-4 md:grid-cols-2">
          <CartaoKpi
            titulo={usoRam ? "Memória RAM principal" : "Memória RAM principal (indisponível)"}
          >
            <p className="text-2xl font-bold">
              {formatarValor(memoriaPrincipal)}
            </p>
            <span className="text-xs text-muted-foreground">
              {percentual}
            </span>
          </CartaoKpi>
          <CartaoKpi titulo="Memória Swap">
            <p className="text-2xl font-bold">
              {swap
                ? `${formatarComUnidade(swap.valor, swap.unidade_medida)} / ${formatarComUnidade(swap.total, swap.unidade_medida)}`
                : "—"}
            </p>
            {swap?.valor_pct != null && (
              <span className="mt-1 block text-xs text-muted-foreground">
                {formatarComUnidade(swap.valor_pct, "%")} de utilização atual
              </span>
            )}
          </CartaoKpi>
          <CartaoKpi
            titulo={`Processo com maior consumo de RAM${!processoMetrica?.nome ? " (indisponível)" : ""}`}
            className="md:col-span-2"
          >
            <p className="font-mono text-sm text-primary">{formatarValor(processo)}</p>
          </CartaoKpi>
        </div>
      );
    }

    if (abaAtiva === "disco") {
      const disco = metrica.detalhes?.disco?.metricas?.uso;
      const armazenamento = disco
        ? `${formatarComUnidade(disco.valor, disco.unidade_medida)} / ${formatarComUnidade(disco.total, disco.unidade_medida)}`
        : "—";
      const uso = disco?.valor_pct ?? 0;

      return (
        <div className="grid gap-4">
          <CartaoKpi titulo="Armazenamento Raiz (/)">
            <p className="text-2xl font-bold">{formatarValor(armazenamento)}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, Number(uso) || 0))}%` }}
              />
            </div>
            <span className="mt-2 block text-xs text-muted-foreground">
              {formatarComUnidade(uso, "%")} do espaço total utilizado
            </span>
          </CartaoKpi>
        </div>
      );
    }

    const rede = metrica.detalhes?.rede;
    const latencia = rede?.metricas?.latencia;
    const pacotesPerdidos = rede?.pacotes?.perdidos;
    const download = rede?.metricas?.download;
    const upload = rede?.metricas?.upload;

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <CartaoKpi titulo="Taxas de Transferência">
          <p className="text-xl font-bold">
            {download
              ? formatarComUnidade(download.valor, download.unidade_medida)
              : "—"}{" "}
            <span className="text-xs font-normal text-muted-foreground">Download</span>
          </p>
          <p className="mt-2 text-xl font-bold">
            {upload
              ? formatarComUnidade(upload.valor, upload.unidade_medida)
              : "—"}{" "}
            <span className="text-xs font-normal text-muted-foreground">Upload</span>
          </p>
        </CartaoKpi>
        <CartaoKpi titulo="Qualidade de Conexão">
          <p className="text-lg font-semibold">
            Latência (Ping):{" "}
            <span className="font-mono">
              {latencia
                ? formatarComUnidade(latencia.valor, latencia.unidade_medida)
                : "—"}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Perda de pacotes (Drop in/out):{" "}
            {pacotesPerdidos
              ? `${pacotesPerdidos.chegando} / ${pacotesPerdidos.saindo} (total: ${pacotesPerdidos.total})`
              : "—"}
          </p>
        </CartaoKpi>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl flex-col rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-card p-6">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {servidor.apelido}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              MAC: {servidor.endereco_mac ?? "Não informado"} | Modelo:{" "}
              {servidor.modelo ?? "Padrão"} | Localidade:{" "}
              {servidor.endereco?.localidade ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-4 border-b border-border px-6">
          {ABAS.map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                abaAtiva === aba
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {aba}
            </button>
          ))}
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
          {metrica && (
            <>
              {renderizarDetalhes()}

              {abaAtiva !== "cpu" && metrica.labels.length > 0 && (
                <div className="relative h-64 rounded-lg border border-border bg-card p-4">
                  <GraficoLinha
                    labels={metrica.labels}
                    linhas={metrica.linhas}
                    unidade={metrica.unidade}
                    max={metrica.max}
                    area
                    limiteMax={metrica.limiteMax}
                    limiteMin={metrica.limiteMin}
                  />
                </div>
              )}
              {metrica.descricao && (
                <p className="text-xs text-muted-foreground">{metrica.descricao}</p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border bg-card p-4">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
