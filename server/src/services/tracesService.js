const {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  buscarArquivoMaisRecentePorHora,
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

function traceTemFalha(trace) {
  const spans = Array.isArray(trace?.spans) ? trace.spans : [];
  return spans.some(
    (span) => String(span?.status || "").toUpperCase() !== "OK",
  );
}

function agregarTraces(registros) {
  let ultimoTimestamp = null;
  let somaDuracaoTotal = 0;

  const duracaoTotal = {
    min: null,
    max: null,
    media: 0,
    qtd: 0,
  };

  const porEtapa = {};
  let tracesFalha = 0;

  for (const trace of registros) {
    const dataTrace = getTimestampTrace(trace);
    if (dataTrace && (!ultimoTimestamp || dataTrace > ultimoTimestamp)) {
      ultimoTimestamp = dataTrace;
    }

    if (traceTemFalha(trace)) tracesFalha += 1;

    if (
      typeof trace.totalDuration === "number" &&
      !Number.isNaN(trace.totalDuration)
    ) {
      duracaoTotal.min =
        duracaoTotal.min === null
          ? trace.totalDuration
          : Math.min(duracaoTotal.min, trace.totalDuration);
      duracaoTotal.max =
        duracaoTotal.max === null
          ? trace.totalDuration
          : Math.max(duracaoTotal.max, trace.totalDuration);
      somaDuracaoTotal += trace.totalDuration;
      duracaoTotal.qtd += 1;
    }

    const spans = Array.isArray(trace.spans) ? trace.spans : [];
    for (const span of spans) {
      const etapa = String(span?.etapa || "DESCONHECIDA");
      const status = String(span?.status || "").toUpperCase();
      const duration =
        typeof span?.duration === "number" && !Number.isNaN(span.duration)
          ? span.duration
          : null;

      if (!porEtapa[etapa]) {
        porEtapa[etapa] = {
          qtd_execucoes: 0,
          qtd_falhas: 0,
          duracao_min: null,
          duracao_max: null,
          duracao_media: 0,
          _soma_duracao: 0,
          _qtd_duracao: 0,
        };
      }

      const alvo = porEtapa[etapa];
      alvo.qtd_execucoes += 1;
      if (status !== "OK") alvo.qtd_falhas += 1;

      if (duration !== null) {
        alvo.duracao_min =
          alvo.duracao_min === null
            ? duration
            : Math.min(alvo.duracao_min, duration);
        alvo.duracao_max =
          alvo.duracao_max === null
            ? duration
            : Math.max(alvo.duracao_max, duration);
        alvo._soma_duracao += duration;
        alvo._qtd_duracao += 1;
      }
    }
  }

  if (duracaoTotal.qtd > 0) {
    duracaoTotal.media = somaDuracaoTotal / duracaoTotal.qtd;
  }

  for (const etapa of Object.keys(porEtapa)) {
    const atual = porEtapa[etapa];
    if (atual._qtd_duracao > 0) {
      atual.duracao_media = atual._soma_duracao / atual._qtd_duracao;
    }
    delete atual._soma_duracao;
    delete atual._qtd_duracao;
  }

  return {
    total_traces: registros.length,
    traces_ok: registros.length - tracesFalha,
    traces_falha: tracesFalha,
    duracao_total: duracaoTotal,
    por_etapa: porEtapa,
    ultimo_timestamp: ultimoTimestamp ? ultimoTimestamp.toISOString() : null,
  };
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
  periodo,
  fim = new Date(),
}) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("[tracesService] A variável AWS_S3_BUCKET não foi definida.");
  }

  const macNormalizado = normalizarMac(endereco_mac);
  if (!macNormalizado) {
    throw new Error("[tracesService] O endereço MAC informado é inválido.");
  }

  if (!periodo) {
    const arquivoMaisRecente = await buscarArquivoMaisRecentePorHora({
      bucket: process.env.AWS_S3_BUCKET,
      basePrefixo: PREFIXO_TRACES,
      fim,
      maxHorasBusca: 24,
      keyFilter: (key) => chaveTraceValidaParaMac(key, macNormalizado),
    });

    if (!arquivoMaisRecente?.Key) {
      return {
        modo: "latest",
        timezone: TIMEZONE,
        arquivo: null,
        count: 0,
        result: [],
      };
    }

    const trace = await lerTraceJsonPorKey(arquivoMaisRecente.Key);
    if (!trace) {
      return {
        modo: "latest",
        timezone: TIMEZONE,
        arquivo: {
          key: arquivoMaisRecente.Key,
          last_modified: arquivoMaisRecente.LastModified || null,
        },
        count: 0,
        result: [],
      };
    }

    return {
      modo: "latest",
      timezone: TIMEZONE,
      arquivo: {
        key: arquivoMaisRecente.Key,
        last_modified: arquivoMaisRecente.LastModified || null,
      },
      count: 1,
      result: [trace],
    };
  }

  const horasPeriodo = PERIODOS_VALIDOS[periodo];
  if (!horasPeriodo) {
    throw new Error("[tracesService] Período inválido. Use: 24h, 15d ou 30d.");
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
      modo: "agregado",
      periodo,
      timezone: TIMEZONE,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      total_arquivos: 0,
      total_registros: 0,
      arquivos_invalidos: 0,
      result: {},
    };
  }

  const registrosFiltrados = [];
  let arquivosInvalidos = 0;

  for (const objeto of objetos) {
    if (!objeto.Key) continue;
    const trace = await lerTraceJsonPorKey(objeto.Key);
    if (!trace) {
      arquivosInvalidos += 1;
      continue;
    }

    const dataTrace = getTimestampTrace(trace);
    if (!dataTrace) continue;
    if (dataTrace >= inicio && dataTrace <= fim) {
      registrosFiltrados.push(trace);
    }
  }

  const resumo = agregarTraces(registrosFiltrados);

  return {
    modo: "agregado",
    periodo,
    timezone: TIMEZONE,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    total_arquivos: objetos.length,
    total_registros: registrosFiltrados.length,
    arquivos_invalidos: arquivosInvalidos,
    result: resumo,
  };
}

module.exports = {
  getTraces,
  PERIODOS_VALIDOS: Object.keys(PERIODOS_VALIDOS),
};
