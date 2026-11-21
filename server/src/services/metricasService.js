const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../aws/s3-client");

const PERIODOS_VALIDOS = {
  "24h": 24,
  "15d": 15 * 24,
  "30d": 30 * 24,
};

const TIMEZONE = "America/Sao_Paulo";
const PREFIXO_METRICAS = "03-gold/metricas";

function normalizarMac(enderecoMac) {
  return String(enderecoMac || "")
    .replace(/[^A-Fa-f0-9]/g, "")
    .toUpperCase();
}

function formatarParticaoPorHora(data) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
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

function montarPrefixoHora(data) {
  const { ano, mes, dia, hora } = formatarParticaoPorHora(data);
  return `${PREFIXO_METRICAS}/ano=${ano}/mes=${mes}/dia=${dia}/hora=${hora}/`;
}

function montarPrefixoDia(data) {
  const { ano, mes, dia } = formatarParticaoPorHora(data);
  return `${PREFIXO_METRICAS}/ano=${ano}/mes=${mes}/dia=${dia}/`;
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

function chaveEhValidaParaMac(key, macNormalizado) {
  return (
    key.startsWith(`${PREFIXO_METRICAS}/`) &&
    key.includes(`/${macNormalizado}_`) &&
    key.endsWith("_captura.jsonl")
  );
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

async function listarObjetosPorPrefixo(prefixo, macNormalizado) {
  const bucket = process.env.AWS_S3_BUCKET;
  const s3 = getS3Client();
  let continuationToken = undefined;
  const encontrados = [];

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefixo,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);
    const contents = response.Contents || [];

    for (const item of contents) {
      if (
        item.Key &&
        chaveEhValidaParaMac(item.Key, macNormalizado) &&
        item.Size > 0
      ) {
        encontrados.push(item);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return encontrados;
}

async function lerJsonlPorKey(key) {
  const bucket = process.env.AWS_S3_BUCKET;
  const s3 = getS3Client();

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const texto = await converterBodyParaString(response.Body);
  const linhas = texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const registros = [];
  for (const linha of linhas) {
    try {
      registros.push(JSON.parse(linha));
    } catch (_error) {
      // ignora linha inválida
    }
  }

  return registros;
}

function agregarMetricas(registros) {
  const agregados = {};
  let ultimoTimestamp = null;

  for (const registro of registros) {
    const dataRegistro = parseTimestampSaoPaulo(registro.timestamp);
    if (dataRegistro && (!ultimoTimestamp || dataRegistro > ultimoTimestamp)) {
      ultimoTimestamp = dataRegistro;
    }

    const componentes = registro.componentes || {};
    for (const [nomeComponente, componente] of Object.entries(componentes)) {
      const metricas = componente.metricas || {};
      if (!agregados[nomeComponente]) {
        agregados[nomeComponente] = {};
      }

      for (const [nomeMetrica, metrica] of Object.entries(metricas)) {
        if (typeof metrica?.valor !== "number" || Number.isNaN(metrica.valor)) {
          continue;
        }

        if (!agregados[nomeComponente][nomeMetrica]) {
          agregados[nomeComponente][nomeMetrica] = {
            unidade_medida: metrica.unidade_medida ?? null,
            limite_max: metrica.limite_max ?? null,
            limite_min: metrica.limite_min ?? null,
            situacao_atual: metrica.situacao ?? null,
            min: metrica.valor,
            max: metrica.valor,
            soma: 0,
            qtd: 0,
            ultimo: metrica.valor,
          };
        }

        const alvo = agregados[nomeComponente][nomeMetrica];
        alvo.min = Math.min(alvo.min, metrica.valor);
        alvo.max = Math.max(alvo.max, metrica.valor);
        alvo.soma += metrica.valor;
        alvo.qtd += 1;
        alvo.ultimo = metrica.valor;
        alvo.situacao_atual = metrica.situacao ?? alvo.situacao_atual;
      }
    }
  }

  for (const componente of Object.values(agregados)) {
    for (const metrica of Object.values(componente)) {
      metrica.media = metrica.qtd > 0 ? metrica.soma / metrica.qtd : 0;
      delete metrica.soma;
    }
  }

  return {
    agregados,
    ultimo_timestamp: ultimoTimestamp
      ? ultimoTimestamp.toISOString()
      : null,
  };
}

async function getMetricas({
  endereco_mac,
  periodo,
  fim = new Date(),
}) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("[metricasService] A variável AWS_S3_BUCKET não foi definida.");
  }

  const macNormalizado = normalizarMac(endereco_mac);
  if (!macNormalizado) {
    throw new Error("[metricasService] O endereço MAC informado é inválido.");
  }

  // Modo padrão: último arquivo inteiro
  if (!periodo) {
    const maxHorasBusca = 24;
    let arquivoMaisRecente = null;

    for (let h = 0; h <= maxHorasBusca; h++) {
      const dataAtual = new Date(fim.getTime() - h * 60 * 60 * 1000);
      const prefixo = montarPrefixoHora(dataAtual);
      const objetos = await listarObjetosPorPrefixo(prefixo, macNormalizado);

      if (objetos.length === 0) continue;

      objetos.sort((a, b) => {
        const dataA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
        const dataB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
        return dataB - dataA;
      });

      arquivoMaisRecente = objetos[0];
      break;
    }

    if (!arquivoMaisRecente?.Key) {
      return {
        modo: "latest",
        timezone: TIMEZONE,
        arquivo: null,
        count: 0,
        result: [],
      };
    }

    const registros = await lerJsonlPorKey(arquivoMaisRecente.Key);
    registros.sort((a, b) =>
      String(a.timestamp || "").localeCompare(String(b.timestamp || "")),
    );

    return {
      modo: "latest",
      timezone: TIMEZONE,
      arquivo: {
        key: arquivoMaisRecente.Key,
        last_modified: arquivoMaisRecente.LastModified || null,
      },
      count: registros.length,
      result: registros,
    };
  }

  // Modo histórico: resumo/agregado
  const horasPeriodo = PERIODOS_VALIDOS[periodo];
  if (!horasPeriodo) {
    throw new Error(
      "[metricasService] Período inválido. Use: 24h, 15d ou 30d.",
    );
  }

  const inicio = new Date(fim.getTime() - horasPeriodo * 60 * 60 * 1000);
  const prefixos = new Set();

  // Otimização: lista por DIA (e não por HORA), reduzindo drasticamente
  // a quantidade de chamadas ListObjectsV2 para janelas de 15d/30d.
  for (
    let cursor = new Date(inicio);
    cursor <= fim;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  ) {
    prefixos.add(montarPrefixoDia(cursor));
  }

  const objetos = [];
  for (const prefixo of prefixos) {
    const encontrados = await listarObjetosPorPrefixo(prefixo, macNormalizado);
    objetos.push(...encontrados);
  }

  if (objetos.length === 0) {
    return {
      modo: "agregado",
      periodo,
      timezone: TIMEZONE,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      total_arquivos: 0,
      total_registros: 0,
      result: {},
    };
  }

  const registrosFiltrados = [];
  for (const objeto of objetos) {
    if (!objeto.Key) continue;
    const registros = await lerJsonlPorKey(objeto.Key);

    for (const registro of registros) {
      const dataRegistro = parseTimestampSaoPaulo(registro.timestamp);
      if (!dataRegistro) continue;
      if (dataRegistro >= inicio && dataRegistro <= fim) {
        registrosFiltrados.push(registro);
      }
    }
  }

  const resumo = agregarMetricas(registrosFiltrados);

  return {
    modo: "agregado",
    periodo,
    timezone: TIMEZONE,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    total_arquivos: objetos.length,
    total_registros: registrosFiltrados.length,
    result: resumo,
  };
}

module.exports = {
  getMetricas,
  PERIODOS_VALIDOS: Object.keys(PERIODOS_VALIDOS),
};
