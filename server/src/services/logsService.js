const {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  listarObjetosPorPeriodoDia,
  lerObjetoTextoPorKey,
} = require("../utils/s3-utils");

const PREFIXO_LOGS = "01-bronze/logs";

function isChaveValida(key, macNormalizado) {
  return (
    key.startsWith(`${PREFIXO_LOGS}/`) &&
    key.includes(`/${macNormalizado}_`) &&
    key.endsWith(".jsonl")
  );
}

function parseJSONL(jsonl) {
  const linhas = jsonl
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const registros = [];
  for (const linha of linhas) {
    try {
      registros.push(JSON.parse(linha));
    } catch {
      continue;
    }
  }

  return registros;
}

async function lerJSONLPorChave(key) {
  const jsonl = await lerObjetoTextoPorKey({
    bucket: process.env.AWS_S3_BUCKET,
    key,
  });
  return parseJSONL(jsonl);
}

async function getLogs({
  endereco_mac,
  periodo = "1h",
  limit = 50,
  offset = 0,
  fim = new Date(),
}) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("[logsService] A variável AWS_S3_BUCKET não foi definida.");
  }

  const macNormalizado = normalizarMac(endereco_mac);
  if (!macNormalizado) {
    throw new Error("[logsService] O endereço MAC informado é inválido.");
  }

  const horasPeriodo = PERIODOS_VALIDOS[periodo];
  if (!horasPeriodo) {
    throw new Error("[logsService] Período inválido. Use: 1h, 24h, 15d ou 30d.");
  }

  const inicio = new Date(fim.getTime() - horasPeriodo * 60 * 60 * 1000);
  const objetos = await listarObjetosPorPeriodoDia({
    bucket: process.env.AWS_S3_BUCKET,
    basePrefixo: PREFIXO_LOGS,
    inicio,
    fim,
    keyFilter: (key) => isChaveValida(key, macNormalizado),
  });

  const logsFiltrados = [];
  for (const objeto of objetos) {
    if (!objeto.Key) continue;

    const registros = await lerJSONLPorChave(objeto.Key);
    for (const registro of registros) {
      const dataRegistro = parseTimestampSaoPaulo(registro.timestamp);
      if (!dataRegistro) continue;
      if (dataRegistro >= inicio && dataRegistro <= fim) {
        logsFiltrados.push(registro);
      }
    }
  }

  logsFiltrados.sort((a, b) => {
    const dataA = parseTimestampSaoPaulo(a.timestamp);
    const dataB = parseTimestampSaoPaulo(b.timestamp);
    return (dataB?.getTime() || 0) - (dataA?.getTime() || 0);
  });

  const total = logsFiltrados.length;
  const result = logsFiltrados.slice(offset, offset + limit);

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
  getLogs,
  PERIODOS_VALIDOS: Object.keys(PERIODOS_VALIDOS),
};
