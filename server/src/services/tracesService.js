const {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  listarObjetosPorPeriodoDia,
  lerObjetoTextoPorKey,
  parseJsonSeguro,
} = require("../utils/s3-utils");

const PREFIXO_TRACES = "03-gold/traces";

function chaveTraceValidaParaMac(key, macNormalizado) {
  return (
    key.startsWith(`${PREFIXO_TRACES}/`) &&
    key.includes(`/${macNormalizado}_`) &&
    key.endsWith("_captura_trace.json")
  );
}

function getTimestampTrace(trace) {
  return (
    parseTimestampSaoPaulo(trace?.timestamp_inicio) ||
    parseTimestampSaoPaulo(trace?.timestamp_fim)
  );
}

async function lerTraceJsonPorKey(key) {
  const texto = await lerObjetoTextoPorKey({
    bucket: process.env.AWS_S3_BUCKET,
    key,
  });

  return parseJsonSeguro(texto);
}

async function getTraces({
  endereco_mac,
  periodo = "1h",
  limit = 50,
  offset = 0,
  fim = new Date(),
}) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("[tracesService] A variável AWS_S3_BUCKET não foi definida.");
  }

  const macNormalizado = normalizarMac(endereco_mac);
  if (!macNormalizado) {
    throw new Error("[tracesService] O endereço MAC informado é inválido.");
  }

  const horasPeriodo = PERIODOS_VALIDOS[periodo];
  if (!horasPeriodo) {
    throw new Error("[tracesService] Período inválido. Use: 1h, 24h, 15d ou 30d.");
  }

  const inicio = new Date(fim.getTime() - horasPeriodo * 60 * 60 * 1000);
  const objetos = await listarObjetosPorPeriodoDia({
    bucket: process.env.AWS_S3_BUCKET,
    basePrefixo: PREFIXO_TRACES,
    inicio,
    fim,
    keyFilter: (key) => chaveTraceValidaParaMac(key, macNormalizado),
  });

  if (objetos.length === 0) {
    return {
      timezone: TIMEZONE,
      periodo,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      total: 0,
      limit,
      offset,
      count: 0,
      has_next: false,
      result: [],
    };
  }

  const registrosFiltrados = [];

  for (const objeto of objetos) {
    if (!objeto.Key) continue;
    const trace = await lerTraceJsonPorKey(objeto.Key);
    if (!trace) continue;

    const dataTrace = getTimestampTrace(trace);
    if (!dataTrace) continue;
    if (dataTrace >= inicio && dataTrace <= fim) {
      registrosFiltrados.push(trace);
    }
  }

  registrosFiltrados.sort((a, b) => {
    const dataA = getTimestampTrace(a);
    const dataB = getTimestampTrace(b);
    return (dataB?.getTime() || 0) - (dataA?.getTime() || 0);
  });

  const total = registrosFiltrados.length;
  const result = registrosFiltrados.slice(offset, offset + limit);

  return {
    timezone: TIMEZONE,
    periodo,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    total,
    limit,
    offset,
    count: result.length,
    has_next: offset + result.length < total,
    result,
  };
}

module.exports = {
  getTraces,
  PERIODOS_VALIDOS: Object.keys(PERIODOS_VALIDOS),
};
