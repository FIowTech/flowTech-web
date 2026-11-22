const {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  buscarArquivoMaisRecentePorHora,
  listarObjetosPorPeriodoDia,
  lerObjetoTextoPorKey,
} = require("../utils/s3-utils");

const PREFIXO_METRICAS = "03-gold/metricas";

function chaveEhValidaParaMac(key, macNormalizado) {
  return (
    key.startsWith(`${PREFIXO_METRICAS}/`) &&
    key.includes(`/${macNormalizado}_`) &&
    key.endsWith("_captura.jsonl")
  );
}

function parseJsonl(texto) {
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

async function lerJsonlPorKey(key) {
  const texto = await lerObjetoTextoPorKey({
    bucket: process.env.AWS_S3_BUCKET,
    key,
  });
  return parseJsonl(texto);
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

  if (!periodo) {
    const arquivoMaisRecente = await buscarArquivoMaisRecentePorHora({
      bucket: process.env.AWS_S3_BUCKET,
      basePrefixo: PREFIXO_METRICAS,
      fim,
      maxHorasBusca: 24,
      keyFilter: (key) => chaveEhValidaParaMac(key, macNormalizado),
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

  const horasPeriodo = PERIODOS_VALIDOS[periodo];
  if (!horasPeriodo) {
    throw new Error(
      "[metricasService] Período inválido. Use: 24h, 15d ou 30d.",
    );
  }

  const inicio = new Date(fim.getTime() - horasPeriodo * 60 * 60 * 1000);
  const objetos = await listarObjetosPorPeriodoDia({
    bucket: process.env.AWS_S3_BUCKET,
    basePrefixo: PREFIXO_METRICAS,
    inicio,
    fim,
    keyFilter: (key) => chaveEhValidaParaMac(key, macNormalizado),
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
