const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../aws/s3-client");

const PERIODOS_VALIDOS = {
  "24h": 24,
  "15d": 15 * 24,
  "30d": 30 * 24,
};

const TIMEZONE = "America/Sao_Paulo";

function normalizarMac(enderecoMac) {
  return String(enderecoMac || "")
    .replace(/[^A-Fa-f0-9]/g, "")
    .toUpperCase();
}

function formatarParticaoPorHora(data, timeZone = TIMEZONE) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(data);

  const valores = {};
  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return {
    ano: valores.year,
    mes: valores.month,
    dia: valores.day,
    hora: valores.hour,
  };
}

function montarPrefixoHora(basePrefixo, data, timeZone = TIMEZONE) {
  const { ano, mes, dia, hora } = formatarParticaoPorHora(data, timeZone);
  return `${basePrefixo}/ano=${ano}/mes=${mes}/dia=${dia}/hora=${hora}/`;
}

function montarPrefixoDia(basePrefixo, data, timeZone = TIMEZONE) {
  const { ano, mes, dia } = formatarParticaoPorHora(data, timeZone);
  return `${basePrefixo}/ano=${ano}/mes=${mes}/dia=${dia}/`;
}

function parseTimestampSaoPaulo(valor) {
  if (typeof valor !== "string") return null;

  const match = valor.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) return null;

  const [, ano, mes, dia, hora, min, seg] = match;
  return new Date(`${ano}-${mes}-${dia}T${hora}:${min}:${seg}-03:00`);
}

async function converterBodyParaString(body) {
  if (!body) return "";

  if (typeof body.transformToString === "function") {
    return body.transformToString();
  }

  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

async function listarObjetosPorPrefixo({
  bucket,
  prefixo,
  keyFilter,
}) {
  const s3 = getS3Client();
  let continuationToken = undefined;
  const encontrados = [];

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefixo,
        ContinuationToken: continuationToken,
      }),
    );

    const contents = response.Contents || [];
    for (const item of contents) {
      if (!item.Key || item.Size <= 0) continue;
      if (typeof keyFilter === "function" && !keyFilter(item.Key)) continue;
      encontrados.push(item);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return encontrados;
}

async function buscarArquivoMaisRecentePorHora({
  bucket,
  basePrefixo,
  fim = new Date(),
  maxHorasBusca = 24,
  keyFilter,
}) {
  for (let h = 0; h <= maxHorasBusca; h++) {
    const dataAtual = new Date(fim.getTime() - h * 60 * 60 * 1000);
    const prefixo = montarPrefixoHora(basePrefixo, dataAtual);
    const objetos = await listarObjetosPorPrefixo({
      bucket,
      prefixo,
      keyFilter,
    });

    if (objetos.length === 0) continue;

    objetos.sort((a, b) => {
      const dataA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
      const dataB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
      return dataB - dataA;
    });

    return objetos[0];
  }

  return null;
}

async function listarObjetosPorPeriodoDia({
  bucket,
  basePrefixo,
  inicio,
  fim,
  keyFilter,
}) {
  const prefixos = new Set();
  for (
    let cursor = new Date(inicio);
    cursor <= fim;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  ) {
    prefixos.add(montarPrefixoDia(basePrefixo, cursor));
  }

  const objetos = [];
  for (const prefixo of prefixos) {
    const encontrados = await listarObjetosPorPrefixo({
      bucket,
      prefixo,
      keyFilter,
    });
    objetos.push(...encontrados);
  }

  return objetos;
}

async function lerObjetoTextoPorKey({ bucket, key }) {
  const s3 = getS3Client();
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return converterBodyParaString(response.Body);
}

function parseJsonSeguro(texto) {
  try {
    return JSON.parse(texto);
  } catch (_error) {
    return null;
  }
}

module.exports = {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  montarPrefixoHora,
  listarObjetosPorPrefixo,
  buscarArquivoMaisRecentePorHora,
  listarObjetosPorPeriodoDia,
  lerObjetoTextoPorKey,
  parseJsonSeguro,
};
