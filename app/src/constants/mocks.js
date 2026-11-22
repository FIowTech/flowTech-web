export const LOG_MOCKS = [
  {
    timestamp: "2026-11-09 19:21:20",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem:
      "Arquivo s3://flowtech-arr-datalake/01-bronze/logs/ano=2026/mes=11/dia=09/hora=19/00933745D2B5_1921_log.jsonl enviado com sucesso (24 registros)",
  },
  {
    timestamp: "2026-11-09 19:21:21",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (1/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:21:50",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (2/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:22:20",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (3/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:22:50",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (4/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:23:20",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (5/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:23:51",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (6/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:24:20",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (7/20 no buffer)",
  },
  {
    timestamp: "2026-11-09 19:24:50",
    endereco_mac: "00:93:37:45:D2:B5",
    severidade: "INFO",
    mensagem: "Coleta realizada com sucesso (8/20 no buffer)",
  },
];

export const TRACE_MOCKS = [];

export const METRICAS_MOCK = {
  cpu: {
    nome: "CPU – Uso",
    valor: 59.2,
    valorPct: 59.2,
    total: 100.0,
    status: "Normal",
    unidadeMedida: "%",
    extra: {
      qtdNucleosFisicos: 16,
      qtdNucleosLogicos: 12,
      mensagem: "Núcleos: 16 Físicos • 12 Lógicos",
    },
  },
  ram: {
    nome: "RAM – Uso",
    valor: 46.0,
    valorPct: 35.9,
    total: 128.0,
    status: "Normal",
    unidadeMedida: "GB",
    extra: {
      mensagem: "",
    },
  },
  disco: {
    nome: "Armazenamento",
    valor: 1.0,
    valorPct: 12.5,
    total: 8.0,
    status: "Normal",
    unidadeMedida: "TB",
    extra: {
      mensagem: "",
    },
  },
  rede: {
    nome: "Rede – Uso",
    valor: 1.1,
    valorPct: null,
    total: null,
    status: "Normal",
    unidadeMedida: "MB/s",
    extra: {
      upload: 0.7,
      download: 0.4,
      latencia: 33.0,
      mensagem: "",
    },
  },
};