import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowsClockwiseIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";

const PERIODOS = ["1h", "24h", "15d", "30d"];

function formatTimestamp(valor) {
  if (!valor) return "—";
  return String(valor).replace("T", " ").slice(0, 19);
}

function statusDaUltimaSpan(trace) {
  const spans = Array.isArray(trace?.spans) ? trace.spans : [];
  const last = spans.at(-1);
  return String(last?.status || "OK").toUpperCase();
}

function durationLabel(totalDuration) {
  const ms = Number(totalDuration || 0);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes > 0) return `${minutes} min ${seconds}s`;
  if (seconds > 0) return `${seconds}s`;
  return `${ms}ms`;
}

function statusChipClass(status) {
  return status === "OK"
    ? "bg-primary-foreground text-primary border-primary"
    : "bg-destructive-foreground text-destructive border-destructive";
}

function spanTime(span) {
  return formatTimestamp(span?.timestamp).slice(-8);
}

function detalhesEtapas(trace) {
  const spans = Array.isArray(trace?.spans) ? trace.spans : [];
  const totalDuration = Number(trace?.totalDuration || 0);
  let acumulado = 0;

  return spans.map((span, index) => {
    const duration = Number(span?.duration || 0);
    const startPct =
      totalDuration > 0 ? Math.min(100, (acumulado / totalDuration) * 100) : 0;
    const widthPct =
      totalDuration > 0 ? Math.min(100, (duration / totalDuration) * 100) : 0;
    acumulado += duration;

    return {
      ...span,
      index,
      startPct,
      widthPct,
      durationLabel: durationLabel(duration),
    };
  });
}

function TraceDetailsSheet({ trace }) {
  const spans = Array.isArray(trace?.spans) ? trace.spans : [];
  const firstSpan = spans.at(0);
  const lastSpan = spans.at(-1);
  const etapas = detalhesEtapas(trace);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Ver detalhes da trace">
            <ArrowSquareOutIcon />
          </Button>
        }
      />
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Rastro:{" "}
            <span className="text-primary">{trace?.id_trace ?? "—"}</span>
          </SheetTitle>
          <SheetDescription>
            Gerado em: {formatTimestamp(trace?.timestamp_inicio)}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:px-6">
          <Resumo valor={spanTime(firstSpan)} label="Primeira etapa às" />
          <Resumo valor={spanTime(lastSpan)} label="Última etapa às" />
          <Resumo
            valor={durationLabel(trace?.totalDuration)}
            label={`(${Number(trace?.totalDuration || 0)}ms)`}
          />
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <h3 className="text-3xl font-heading font-semibold">Etapas do rastreamento</h3>
          {etapas.map((span) => (
            <div key={`${span.etapa}-${span.index}`} className="rounded-md border border-border p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{span.etapa}</p>
                  <p className="text-sm text-muted-foreground">
                    {span.detalhe || "Sem detalhes"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {spanTime(span)} • {span.durationLabel}
                </p>
              </div>
              <div className="relative h-2 w-full rounded-full border border-border bg-background-dark/60">
                <div
                  className={`absolute top-0 h-2 rounded-full ${statusDaUltimaSpan({ spans: [span] }) === "OK" ? "bg-primary" : "bg-destructive"}`}
                  style={{ left: `${span.startPct}%`, width: `${span.widthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Resumo({ label, valor }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-heading font-semibold">{valor || "—"}</p>
    </div>
  );
}

export function TracesTable({
  traces,
  isLoading,
  error,
  searchTerm,
  onSearchTermChange,
  periodo,
  onPeriodoChange,
  onRefetch,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  pageSize = 10,
}) {
  return (
    <Card className="bg-background">
      <CardHeader className="gap-4">
        <CardTitle>Rastreamento das passagens e telemetria (Traces)</CardTitle>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar por trace-id ou timestamp..."
            className="lg:max-w-md"
          />
          <div className="flex items-center gap-2 lg:ml-auto">
            <Select value={periodo} onValueChange={onPeriodoChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onRefetch}>
              <ArrowsClockwiseIcon />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-95 overflow-y-auto rounded-md border border-border">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trace ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Duração total</TableHead>
                  <TableHead>Status da span</TableHead>
                  <TableHead className="text-right">Ver mais</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Não foi possível carregar as traces. Tente atualizar.
                    </TableCell>
                  </TableRow>
                )}
                {!error && traces.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma trace encontrada para o período.
                    </TableCell>
                  </TableRow>
                )}
                {!error &&
                  traces.map((trace, index) => {
                    const status = statusDaUltimaSpan(trace);
                    const rowKey = trace?.id_trace ?? `${trace?.timestamp_inicio}-${index}`;

                    return (
                      <TableRow key={rowKey}>
                        <TableCell>{trace?.id_trace ?? "—"}</TableCell>
                        <TableCell>{formatTimestamp(trace?.timestamp_inicio)}</TableCell>
                        <TableCell>{durationLabel(trace?.totalDuration)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusChipClass(status)}`}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <TraceDetailsSheet trace={trace} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {Math.max(1, totalPages)} • {pageSize} visíveis por vez
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrevPage} disabled={page <= 1}>
              Anterior
            </Button>
            <Button
              variant={page >= totalPages ? "outline" : "default"}
              size="sm"
              onClick={onNextPage}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
