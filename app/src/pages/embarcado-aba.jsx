import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ModalDetalhesEmbarcado({ servidor, isOpen, onClose, abaInicial = "cpu" }) {
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);

  useEffect(() => {
    if (abaInicial) {
      setAbaAtiva(abaInicial);
    }
  }, [abaInicial]);

  if (!isOpen || !servidor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-4xl flex flex-col shadow-2xl">
        
        {/* Header com Informações Básicas do Embarcado */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-semibold font-heading text-foreground">
              {servidor.apelido}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              MAC: {servidor.endereco_mac ?? "Não informado"} | Modelo: {servidor.modelo ?? "Padrão"} | Localidade: {servidor.endereco?.localidade ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Sistema de Abas */}
        <div className="flex border-b border-border px-6 gap-4 bg-">
          {["cpu", "ram", "disco", "rede"].map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`py-3 px-4 text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                abaAtiva === aba
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {aba}
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico Baseado nas Métricas do Script Python */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {abaAtiva === "cpu" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Uso Atual de CPU</h3>
                <p className="text-2xl font-bold">45.2%</p>
                <span className="text-xs text-muted-foreground">Frequência: 2400 MHz / Max: 3600 MHz</span>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Arquitetura de Núcleos</h3>
                <p className="text-2xl font-bold">8 Físicos / 16 Lógicos</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Load Average (1m, 5m, 15m)</h3>
                <p className="text-lg font-mono">1.25, 1.10, 0.95</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Processo com maior consumo de CPU</h3>
                <p className="text-sm font-mono text-primary">writer-csv.py (PID: 1420)</p>
              </div>
            </div>
          )}

          {abaAtiva === "ram" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Memória RAM Principal</h3>
                <p className="text-2xl font-bold">6.4 GB / 15.6 GB</p>
                <span className="text-xs text-muted-foreground">41% de utilização atual</span>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Memória Swap</h3>
                <p className="text-2xl font-bold">512 MB / 2.0 GB</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Processo com maior consumo de RAM</h3>
                <p className="text-sm font-mono text-primary">mysqld (PID: 850)</p>
              </div>
            </div>
          )}

          {abaAtiva === "disco" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Armazenamento Raiz (/)</h3>
                <p className="text-2xl font-bold">120 GB / 500 GB</p>
                <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[24%]" />
                </div>
                <span className="text-xs text-muted-foreground mt-2 block">24% do espaço total utilizado</span>
              </div>
            </div>
          )}

          {abaAtiva === "rede" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Taxas de Transferência (Speedtest)</h3>
                <p className="text-xl font-bold">45.8 Mbps <span className="text-xs font-normal text-muted-foreground">Download</span></p>
                <p className="text-xl font-bold mt-2">12.4 Mbps <span className="text-xs font-normal text-muted-foreground">Upload</span></p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Qualidade de Conexão</h3>
                <p className="text-lg font-semibold">Latência (Ping): <span className="font-mono">14.2 ms</span></p>
                <p className="text-xs text-muted-foreground mt-2">Perda de pacotes (Drop in/out): 0 / 0</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}