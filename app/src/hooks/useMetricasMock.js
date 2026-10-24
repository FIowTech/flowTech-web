import { useEffect, useState } from "react";

// Hook de MOCK: simula leituras de CPU, RAM, rede e disco chegando de tempo em tempo.

const INTERVALO_MS = 3000; // a cada quanto tempo chega um ponto novo
const QTD_PONTOS = 12; // quantos pontos aparecem nos gráficos
const CAPACIDADE_DISCO = 8000; // GB (8 TB)
const DIAS_DISCO = ["OUT 1", "OUT 2", "OUT 3", "OUT 4", "OUT 5", "OUT 6", "OUT 7"];

function proximoValor(anterior, variacao, minimo, maximo) {
  const mudanca = (Math.random() * 2 - 1) * variacao; // entre -variacao e +variacao
  const novo = anterior + mudanca;
  const dentroDosLimites = Math.min(maximo, Math.max(minimo, novo));

  return Math.round(dentroDosLimites * 10) / 10; // 1 casa decimal
}

function andarJanela(lista, novoValor) {
  return [...lista.slice(1), novoValor];
}

function ultimo(lista) {
  return lista[lista.length - 1];
}

function formatarHora(data) {
  return data.toLocaleTimeString("pt-BR"); // ex.: "14:32:05"
}

function criarEstadoInicial() {
  const horarios = [];
  for (let i = QTD_PONTOS - 1; i >= 0; i--) {
    horarios.push(formatarHora(new Date(Date.now() - i * INTERVALO_MS)));
  }

  return {
    horarios,
    cpu: [40, 45, 52, 48, 60, 66, 58, 70, 64, 62, 68, 62],
    ram: [66, 67, 68, 70, 69, 71, 72, 71, 73, 72, 74, 73],
    download: [80, 85, 90, 70, 95, 100, 88, 92, 97, 90, 94, 92],
    upload: [20, 25, 22, 30, 28, 35, 31, 29, 33, 30, 32, 31],
    discoUsado: [3100, 3140, 3175, 3210, 3248, 3280, 3310], // GB usados em cada dia
  };
}

export const useMetricasMock = () => {
  const [estado, setEstado] = useState(criarEstadoInicial);

  useEffect(() => {
    // A cada INTERVALO_MS, gera uma "leitura nova" para cada métrica
    const intervalo = setInterval(() => {
      setEstado((anterior) => {
        // O disco só cresce, e só o último dia (hoje) muda
        const hoje = ultimo(anterior.discoUsado);
        const novoHoje = Math.min(
          CAPACIDADE_DISCO,
          Math.round((hoje + Math.random() * 1.5) * 10) / 10,
        );

        return {
          horarios: andarJanela(anterior.horarios, formatarHora(new Date())),
          cpu: andarJanela(anterior.cpu, proximoValor(ultimo(anterior.cpu), 8, 5, 100)),
          ram: andarJanela(anterior.ram, proximoValor(ultimo(anterior.ram), 2, 40, 120)),
          download: andarJanela(
            anterior.download,
            proximoValor(ultimo(anterior.download), 10, 20, 100),
          ),
          upload: andarJanela(
            anterior.upload,
            proximoValor(ultimo(anterior.upload), 5, 5, 40),
          ),
          discoUsado: [...anterior.discoUsado.slice(0, -1), novoHoje],
        };
      });
    }, INTERVALO_MS);

    // Quando a Home sai da tela, para o relógio (senão ele continuaria rodando)
    return () => clearInterval(intervalo);
  }, []);

  return {
    horarios: estado.horarios,
    cpu: {
      atual: Math.round(ultimo(estado.cpu)) + "%",
      valores: estado.cpu,
    },
    ram: {
      atual: ultimo(estado.ram).toFixed(1) + " GiB",
      valores: estado.ram,
    },
    rede: {
      atual:
        "↓ " + Math.round(ultimo(estado.download)) +
        " Mbps · ↑ " + Math.round(ultimo(estado.upload)) + " Mbps",
      download: estado.download,
      upload: estado.upload,
    },
    disco: {
      dias: DIAS_DISCO,
      usado: estado.discoUsado,
      capacidade: CAPACIDADE_DISCO,
    },
  };
};