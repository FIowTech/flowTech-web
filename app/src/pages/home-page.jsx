import {
  ResumoCard, ResumoTotal, StatusCount } from "@/components/dashboard/resumo-card";
import { GraficoLinha } from "@/components/dashboard/graficos";
import { MetricaPainel } from "@/components/dashboard/metrica-painel";
import { ServidorBusca } from "@/components/dashboard/servidor-busca";
import { ServidorDetalhes } from "@/components/dashboard/servidor-detalhes";
import { ServidorMapa } from "@/components/dashboard/servidor-mapa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Relogio } from "@/components/relogio";
import { useAuth } from "@/store/auth-store";
import { BellIcon, CameraIcon, HardDrivesIcon } from "@phosphor-icons/react";
import { useState } from "react";

// TODO: trocar pela API (GET /embarcados) quando o endpoint retornar o
// endereço e as métricas junto com o embarcado.
const tempEmpresaRazaoSocial = "Vision Center de Vias do Brasil S.A.";
const tempAtualizadoEm = "16:15";

const tempServidores = [
  {
    id_embarcado: 101,
    apelido: "SRV-101",
    modelo: "PARD-SR1180",
    endereco_mac: "1B:2B:3C:4D:5E:6F",
    status: "vermelho",
    endereco: {
      cep: "0000-000",
      localidade: "São Paulo",
      uf: "SP",
      km: "101",
      sentido: "Sul",
      lat: -23.5505,
      lon: -46.6333,
    },
    sistema: { cpu: "24 físicos / 24 lógicos", ram: "24 GiB", disco: "1 TB" },
  },
  {
    id_embarcado: 102,
    apelido: "SRV-102",
    modelo: "PARD-SR1180",
    endereco_mac: "1B:2B:3C:4D:5E:70",
    status: "verde",
    endereco: {
      cep: "0000-000",
      localidade: "Guarulhos",
      uf: "SP",
      km: "215",
      sentido: "Norte",
      lat: -23.4543,
      lon: -46.5333,
    },
    sistema: { cpu: "16 físicos / 32 lógicos", ram: "32 GiB", disco: "2 TB" },
  },
  {
    id_embarcado: 103,
    apelido: "SRV-103",
    modelo: "PARD-SR1200",
    endereco_mac: "1B:2B:3C:4D:5E:71",
    status: "amarelo",
    endereco: {
      cep: "0000-000",
      localidade: "Osasco",
      uf: "SP",
      km: "18",
      sentido: "Leste",
      lat: -23.5329,
      lon: -46.7917,
    },
    sistema: { cpu: "8 físicos / 16 lógicos", ram: "16 GiB", disco: "1 TB" },
  },
];

const cores = {
  verde: "#36c876",
  amarelo: "#eebb4d",
  cinza: "#515c54",
};

// métricas do servidor selecionado (componentes: cpu_usage_pct, ram_usage_mb,
// download_mbps, upload_mbps, disk_usage_mb)
const tempHorarios = [
  "10:00", "10:05", "10:10", "10:15", "10:20", "10:25",
  "10:30", "10:35", "10:40", "10:45", "10:50", "10:55",
];

const tempMetricas = {
  cpu: {
    atual: "62%",
    valores: [40, 45, 52, 48, 60, 66, 58, 70, 64, 62, 68, 62],
  },
  ram: {
    atual: "18,4 GiB",
    valores: [14, 14.2, 15, 16, 16.1, 17, 17.3, 18, 18.2, 18.1, 18.6, 18.4],
  },
  rede: {
    atual: "↓ 92 Mbps · ↑ 31 Mbps",
    download: [80, 85, 90, 70, 95, 100, 88, 92, 97, 90, 94, 92],
    upload: [20, 25, 22, 30, 28, 35, 31, 29, 33, 30, 32, 31],
  },
  disco: {
    dias: ["OUT 1", "OUT 2", "OUT 3", "OUT 4", "OUT 5", "OUT 6", "OUT 7"],
    usado: [380, 385, 391, 398, 402, 407, 412],
    capacidade: 1000,
  },
};

const tempResumoEmbarcados = { verde: 7, amarelo: 3, vermelho: 2, total: 12 };
const tempResumoAlertas = { amarelo: 3, vermelho: 2, total: 24 };
const tempResumoCapturas = { recebidas: 100, esperadas: 100, porticos: 5 };

export default function HomePage() {
  const usuario = useAuth((state) => state.usuario);

  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState(
    tempServidores[0].id_embarcado,
  );

  const handleBuscaChange = (e) => setBusca(e.target.value);

  // média do disco: soma tudo e divide pela quantidade de dias
  let somaDisco = 0;
  for (const valor of tempMetricas.disco.usado) {
    somaDisco += valor;
  }
  const mediaDisco = (somaDisco / tempMetricas.disco.usado.length).toFixed(1);

  const termo = busca.trim().toLowerCase();
  const servidoresFiltrados = tempServidores.filter((servidor) => {
    const texto =
      servidor.apelido + " " + servidor.modelo + " " + servidor.endereco.localidade;

    return texto.toLowerCase().includes(termo);
  });

  const selecionado = tempServidores.find(
    (servidor) => servidor.id_embarcado === selecionadoId,
  );

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* topbar */}
      <div className="bg-background border border-border p-4 rounded-md w-full flex items-center justify-between">
        <div>
          <p>Olá, {usuario?.nome ?? "usuário"}!</p>
          <h2 className="text-xl">{tempEmpresaRazaoSocial}</h2>
        </div>

        <Relogio />
      </div>

      {/* resumo */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumoCard
          titulo="Situação Embarcados"
          icon={HardDrivesIcon}
          tom="warning"
          atualizadoEm={tempAtualizadoEm}
        >
          <StatusCount status="verde" quantidade={tempResumoEmbarcados.verde} />
          <StatusCount status="amarelo" quantidade={tempResumoEmbarcados.amarelo} />
          <StatusCount status="vermelho" quantidade={tempResumoEmbarcados.vermelho} />
          <ResumoTotal total={tempResumoEmbarcados.total} />
        </ResumoCard>

        <ResumoCard
          titulo="Alertas e Notificações"
          icon={BellIcon}
          tom="destructive"
          atualizadoEm={tempAtualizadoEm}
        >
          <StatusCount status="amarelo" quantidade={tempResumoAlertas.amarelo} />
          <StatusCount status="vermelho" quantidade={tempResumoAlertas.vermelho} />
          <ResumoTotal total={tempResumoAlertas.total} />
        </ResumoCard>

        <ResumoCard
          titulo="Capturas Recebidas/Esperadas"
          icon={CameraIcon}
          atualizadoEm={tempAtualizadoEm}
        >
          {tempResumoCapturas.recebidas} / {tempResumoCapturas.esperadas}
          <span className="text-xs font-normal text-muted-foreground">
            de {tempResumoCapturas.porticos} pórticos
          </span>
        </ResumoCard>
      </section>

      {/* busca + mapa + detalhes */}
      <section className="flex flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ServidorBusca value={busca} onChange={handleBuscaChange} />

          <ServidorMapa
            servidores={servidoresFiltrados}
            onSelecionar={setSelecionadoId}
          />
        </div>

        <ServidorDetalhes servidor={selecionado} />
      </section>

      {/* métricas do servidor selecionado */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Métricas de {selecionado?.apelido ?? "—"}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-2">
          <MetricaPainel titulo="Métricas CPU" valor={tempMetricas.cpu.atual}>
            <GraficoLinha
              labels={tempHorarios}
              linhas={[
                { nome: "Uso de CPU", valores: tempMetricas.cpu.valores, cor: cores.verde },
              ]}
              unidade="%"
              max={100}
              area
            />
          </MetricaPainel>

          <MetricaPainel titulo="Métricas RAM" valor={tempMetricas.ram.atual}>
            <GraficoLinha
              labels={tempHorarios}
              linhas={[
                { nome: "Uso de RAM", valores: tempMetricas.ram.valores, cor: cores.amarelo },
              ]}
              unidade="GiB"
              area
            />
          </MetricaPainel>

          <MetricaPainel titulo="Métricas Rede" valor={tempMetricas.rede.atual}>
            <GraficoLinha
              labels={tempHorarios}
              linhas={[
                { nome: "Download", valores: tempMetricas.rede.download, cor: cores.verde },
                { nome: "Upload", valores: tempMetricas.rede.upload, cor: cores.cinza },
              ]}
              unidade="Mbps"
            />
          </MetricaPainel>

          <MetricaPainel
            titulo="Métricas Disco"
            descricao="Média de espaço usado neste mês"
            valor={mediaDisco + " GiB"}
          >
            <GraficoLinha
              labels={tempMetricas.disco.dias}
              linhas={[
                { nome: "Disco usado", valores: tempMetricas.disco.usado, cor: cores.verde },
              ]}
              unidade="GiB"
              max={tempMetricas.disco.capacidade}
              area
            />
          </MetricaPainel>
        </CardContent>
      </Card>
    </div>
  );
}
