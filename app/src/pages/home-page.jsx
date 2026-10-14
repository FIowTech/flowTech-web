import {
  ResumoCard,
  ResumoTotal,
  StatusCount,
} from "@/components/dashboard/resumo-card";
import { ServidorBusca } from "@/components/dashboard/servidor-busca";
import { ServidorDetalhes } from "@/components/dashboard/servidor-detalhes";
import { Relogio } from "@/components/relogio";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/store/auth-store";
import { BellIcon, CameraIcon, HardDrivesIcon } from "@phosphor-icons/react";
import { useState } from "react";

// TODO: trocar pelos dados da API (GET /embarcados) quando o endpoint
// passar a retornar endereço e métricas junto com o embarcado.
const empresaNome = "Vision Center de Vias do Brasil S.A.";
const atualizadoEm = "16:15";

const servidores = [
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

const resumoEmbarcados = { verde: 7, amarelo: 3, vermelho: 2, total: 12 };
const resumoAlertas = { amarelo: 3, vermelho: 2, total: 24 };
const resumoCapturas = { recebidas: 100, esperadas: 100, porticos: 5 };

export default function HomePage() {
  const user = useAuth((state) => state.usuario);

  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState(
    servidores[0].id_embarcado,
  );

  const handleBuscaChange = (e) => setBusca(e.target.value);

  const termo = busca.trim().toLowerCase();
  const servidoresFiltrados = servidores.filter((servidor) =>
    [servidor.apelido, servidor.modelo, servidor.endereco.localidade]
      .join(" ")
      .toLowerCase()
      .includes(termo),
  );

  const selecionado = servidores.find(
    (servidor) => servidor.id_embarcado === selecionadoId,
  );

  return (
    <>
      <Card size="sm" className="flex-row items-center justify-between px-4">
        <div>
          <span className="block text-xs text-muted-foreground">
            Olá, {user?.nome ?? "usuário"}!
          </span>

          <h1 className="font-heading text-xl font-semibold">{empresaNome}</h1>
        </div>

        <Relogio />
      </Card>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumoCard
          titulo="Situação Embarcados"
          icon={HardDrivesIcon}
          atualizadoEm={atualizadoEm}
        >
          <StatusCount status="verde" quantidade={resumoEmbarcados.verde} />
          <StatusCount status="amarelo" quantidade={resumoEmbarcados.amarelo} />
          <StatusCount
            status="vermelho"
            quantidade={resumoEmbarcados.vermelho}
          />
          <ResumoTotal total={resumoEmbarcados.total} />
        </ResumoCard>

        <ResumoCard
          titulo="Alertas e Notificações"
          icon={BellIcon}
          atualizadoEm={atualizadoEm}
        >
          <StatusCount status="amarelo" quantidade={resumoAlertas.amarelo} />
          <StatusCount status="vermelho" quantidade={resumoAlertas.vermelho} />
          <ResumoTotal total={resumoAlertas.total} />
        </ResumoCard>

        <ResumoCard
          titulo="Capturas Recebidas/Esperadas"
          icon={CameraIcon}
          atualizadoEm={atualizadoEm}
        >
          {resumoCapturas.recebidas} / {resumoCapturas.esperadas}
          <span className="text-xs font-normal text-muted-foreground">
            de {resumoCapturas.porticos} pórticos
          </span>
        </ResumoCard>
      </section>

      <section className="flex flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ServidorBusca value={busca} onChange={handleBuscaChange} />
        </div>

        <ServidorDetalhes servidor={selecionado} />
      </section>
    </>
  );
}
