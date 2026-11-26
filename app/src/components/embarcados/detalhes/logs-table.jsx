import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowsClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

const PERIODOS = ["1h", "24h", "15d", "30d"];

function chipSeveridade(severidade) {
  const value = String(severidade || "").toUpperCase();
  if (value === "ERRO") {
    return "bg-destructive-foreground text-destructive border-destructive";
  }
  if (value === "ALERTA" || value === "WARNING") {
    return "bg-warning-foreground text-warning border-warning";
  }
  return "bg-primary-foreground text-primary border-primary";
}

function formatTimestamp(valor) {
  if (!valor) return "—";
  return String(valor).replace("T", " ").slice(0, 19);
}

export function LogsTable({
  logs,
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
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (key) =>
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card className="bg-background">
      <CardHeader className="gap-4">
        <CardTitle>Logs do Cliente local</CardTitle>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar por mensagem ou timestamp..."
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Não foi possível carregar os logs. Tente atualizar.
                    </TableCell>
                  </TableRow>
                )}
                {!error && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum log encontrado para o período.
                    </TableCell>
                  </TableRow>
                )}
                {!error &&
                  logs.map((log, index) => {
                    const rowKey = `${log.timestamp}-${index}`;
                    const expanded = !!expandedRows[rowKey];
                    const mensagem = String(log.mensagem || "—");
                    const pequena = mensagem.length > 82 && !expanded;

                    return (
                      <TableRow key={rowKey}>
                        <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${chipSeveridade(log.severidade)}`}
                          >
                            {String(log.severidade || "INFO").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0">
                          <div className="flex items-center gap-2">
                            <span className={expanded ? "break-all" : "truncate"}>
                              {pequena ? `${mensagem.slice(0, 82)}...` : mensagem}
                            </span>
                            {mensagem.length > 82 && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => toggleExpand(rowKey)}
                                aria-label={expanded ? "Recolher mensagem" : "Expandir mensagem"}
                              >
                                {expanded ? <CaretUpIcon /> : <CaretDownIcon />}
                              </Button>
                            )}
                          </div>
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
