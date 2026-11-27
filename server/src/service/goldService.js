"use strict";

const s3 = require("./s3Service");

const COMPONENTES = ["cpu", "ram", "disco", "rede"];

const PASTA_GOLD = (process.env.GOLD_PREFIXO ?? "03-gold/metricas/").replace(/\/?$/, "/");

const HORAS_ATRAS = Number(process.env.GOLD_HORAS_ATRAS ?? 3);
const TTL_MS = Number(process.env.GOLD_CACHE_SEGUNDOS ?? 15) * 1000;

class ErroValidacao extends Error {}

// ---------- MAC ----------

function normalizarMac(mac) {
  const limpo = String(mac ?? "")
    .replace(/[:-]/g, "")
    .toUpperCase();

  if (!/^[0-9A-F]{12}$/.test(limpo)) {
    throw new ErroValidacao("Endereço MAC inválido.");
  }

  return limpo;
}

const doisDigitos = (n) => String(n).padStart(2, "0");

// ---------- Fuso horário ----------

function fusoEtlHoras() {
  const definido = process.env.GOLD_FUSO_ETL_HORAS;

  if (definido !== undefined && definido !== "") {
    return Number(definido);
  }

  return -new Date().getTimezoneOffset() / 60;
}

// ---------- Prefixos S3 ----------

// Estrutura esperada:
//
// 03-gold/
//   ano=2026/
//     mes=11/
//       dia=21/
//         hora=01/
//           003676542289_0118_captura.jsonl
//
// O arquivo contém registros completos de todos os componentes.

function prefixosDasUltimasHoras(
  mac,
  {
    agora = new Date(),
    horas = HORAS_ATRAS,
  } = {},
) {
  const fuso = fusoEtlHoras();
  const prefixos = [];

  for (let atras = 0; atras < horas; atras++) {
    const d = new Date(
      agora.getTime() + (fuso - atras) * 3_600_000,
    );

    prefixos.push(
      `${PASTA_GOLD}` +
        `ano=${d.getUTCFullYear()}/` +
        `mes=${doisDigitos(d.getUTCMonth() + 1)}/` +
        `dia=${doisDigitos(d.getUTCDate())}/` +
        `hora=${doisDigitos(d.getUTCHours())}/` +
        `${mac}_`,
    );
  }

  return prefixos;
}

// ---------- Cache ----------

const cache = new Map();

function comCache(chave, fn) {
  const item = cache.get(chave);

  if (item && item.expira > Date.now()) {
    return item.promessa;
  }

  if (cache.size > 1000) {
    for (const [k, v] of cache) {
      if (v.expira <= Date.now()) {
        cache.delete(k);
      }
    }
  }

  const promessa = fn().catch((erro) => {
    cache.delete(chave);
    throw erro;
  });

  cache.set(chave, {
    promessa,
    expira: Date.now() + TTL_MS,
  });

  return promessa;
}

function limparCache() {
  cache.clear();
}

// ---------- Concorrência ----------

async function mapaComLimite(lista, limite, fn) {
  const resultados = new Array(lista.length);
  let proximo = 0;

  const trabalhador = async () => {
    while (proximo < lista.length) {
      const i = proximo++;
      resultados[i] = await fn(lista[i], i);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(limite, lista.length) },
      trabalhador,
    ),
  );

  return resultados;
}

// ---------- Leitura dos arquivos ----------

function normalizarRegistros(conteudo) {
  if (!conteudo) return [];

  // JSONL retornado pelo s3Service
  if (Array.isArray(conteudo)) {
    return conteudo.filter(
      (registro) =>
        registro &&
        typeof registro === "object" &&
        registro.timestamp &&
        registro.componentes,
    );
  }

  // Compatibilidade com arquivo JSON contendo um único registro
  if (
    typeof conteudo === "object" &&
    conteudo.timestamp &&
    conteudo.componentes
  ) {
    return [conteudo];
  }

  return [];
}

function registroPertenceMac(registro, mac) {
  try {
    return normalizarMac(registro.endereco_mac) === mac;
  } catch {
    return false;
  }
}

function ordenarRegistros(registros) {
  const porTimestamp = new Map();

  for (const registro of registros) {
    if (!registro.timestamp) continue;

    // Caso o ETL repita o timestamp, mantém o último registro encontrado.
    porTimestamp.set(registro.timestamp, registro);
  }

  return [...porTimestamp.values()].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );
}

async function buscarRegistros(mac, horas = HORAS_ATRAS) {
  const prefixos = prefixosDasUltimasHoras(mac, { horas });

  const objetosPorHora = await Promise.all(
    prefixos.map((prefixo) => s3.listObjects(prefixo)),
  );

  const objetos = objetosPorHora.flat();

  const registrosPorArquivo = await mapaComLimite(
    objetos,
    8,
    async (objeto) => {
      const conteudo = await s3.getObject(objeto.Key);

      return normalizarRegistros(conteudo);
    },
  );

  return ordenarRegistros(
    registrosPorArquivo
      .flat()
      .filter((registro) => registroPertenceMac(registro, mac)),
  );
}

// ---------- Métricas ----------

// Transforma métricas do ETL em formato amigável para gráficos.

function extrairMetricas(componente) {
  if (!componente?.metricas) return [];

  return Object.entries(componente.metricas)
    .filter(
      ([, metrica]) =>
        metrica && typeof metrica === "object",
    )
    .map(([chave, metrica]) => {
      const valor =
        metrica.valor_pct !== null &&
        metrica.valor_pct !== undefined
          ? metrica.valor_pct
          : metrica.valor;

      return {
        chave,
        nome: metrica.nome ?? chave,
        valor: valor ?? null,
        valor_bruto: metrica.valor ?? null,
        valor_pct: metrica.valor_pct ?? null,
        unidade_medida: metrica.unidade_medida ?? null,

        // Utiliza a situação própria da métrica
        situacao: metrica.situacao ?? null,

        limite_min: metrica.limite_min ?? null,
        limite_max: metrica.limite_max ?? null,
      };
    });
}

// ---------- Situação ----------

function nivelDe(situacao) {
  if (!situacao) return null;

  const nivel = String(situacao)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (nivel === "critico") return "critico";
  if (nivel === "alerta") return "alerta";
  if (nivel === "normal") return "normal";

  return null;
}

const PESO = {
  critico: 3,
  alerta: 2,
  normal: 1,
};

const STATUS_NUMERICO = {
  critico: 0,
  normal: 1,
  alerta: 2,
};

function montarSnapshot(registro) {
  const componentes = registro?.componentes ?? {};
  const alertas = [];

  let pior = null;

  for (const [nomeComponente, componente] of Object.entries(componentes)) {
    const metricas = extrairMetricas(componente);

    // Situação geral do componente
    const nivelComponente = nivelDe(componente.situacao);

    if (
      nivelComponente &&
      (!pior || PESO[nivelComponente] > PESO[pior])
    ) {
      pior = nivelComponente;
    }

    // Coleta o componente se estiver crítico
    if (nivelComponente === "critico") {
      alertas.push({
        componente: nomeComponente,
        parametro: "Componente",
        valor: null,
        unidade_medida: null,
        limite_min: null,
        limite_max: null,
        situacao: componente.situacao,
        nivel: "critico",
        momento: registro.timestamp,
      });
    }

    // Analisa as métricas individualmente
    for (const metrica of metricas) {
      const nivel = nivelDe(metrica.situacao);

      if (
        nivel &&
        (!pior || PESO[nivel] > PESO[pior])
      ) {
        pior = nivel;
      }

      // Coleta somente métricas críticas
      if (nivel === "critico") {
        alertas.push({
          componente: nomeComponente,
          parametro: metrica.nome,
          valor: metrica.valor,
          unidade_medida: metrica.unidade_medida,
          limite_min: metrica.limite_min,
          limite_max: metrica.limite_max,
          situacao: metrica.situacao,
          nivel,
          momento: registro.timestamp,
        });
      }
    }
  }

  // Ordena os alertas: críticos primeiro
  alertas.sort(
    (a, b) => PESO[b.nivel] - PESO[a.nivel],
  );

  return {
    id_embarcado: registro.id_embarcado,
    id_empresa: registro.id_empresa,
    endereco_mac: registro.endereco_mac,
    ip: registro.ip,

    status: pior ? STATUS_NUMERICO[pior] : null,
    nivel: pior ?? "sem_dados",

    ultima_leitura: registro.timestamp,

    componentes,
    alertas,
  };
}

// ---------- Snapshot ----------

async function ultimoSnapshot(macBruto) {
  const mac = normalizarMac(macBruto);

  return comCache(`snap|${mac}`, async () => {
    const registros = await buscarRegistros(mac);

    const ultimo = registros.at(-1);

    if (!ultimo) {
      return {
        status: null,
        nivel: "sem_dados",
        ultima_leitura: null,
        componentes: {},
        alertas: [],
      };
    }

    return montarSnapshot(ultimo);
  });
}

// ---------- Série histórica ----------

async function serie(
  macBruto,
  componente,
  {
    horas = HORAS_ATRAS,
    maxPontos = 30,
  } = {},
) {
  if (!COMPONENTES.includes(componente)) {
    throw new ErroValidacao(
      `Componente inválido. Use: ${COMPONENTES.join(", ")}.`,
    );
  }


  const mac = normalizarMac(macBruto);

  return comCache(
    `serie|${mac}|${componente}|${horas}|${maxPontos}`,
    async () => {
      const registros = await buscarRegistros(mac, horas);

      const selecionados = registros.slice(-maxPontos);

      const metricasPorRegistro = selecionados.map((registro) => {
        const grupo = registro.componentes?.[componente];

        return {
          timestamp: registro.timestamp,
          metricas: extrairMetricas(grupo),
        };
      });

      const nomes = [
        ...new Set(
          metricasPorRegistro.flatMap((registro) =>
            registro.metricas.map((metrica) => metrica.nome),
          ),
        ),
      ];

      const parametros = Object.fromEntries(
        nomes.map((nome) => [
          nome,
          {
            valores: [],
            valores_brutos: [],
            situacoes: [],
            unidades: [],
            limite_min: null,
            limite_max: null,
          },
        ]),
      );

      for (const registro of metricasPorRegistro) {
        const metricas = new Map(
          registro.metricas.map((metrica) => [
            metrica.nome,
            metrica,
          ]),
        );

        for (const nome of nomes) {
          const metrica = metricas.get(nome);
          const destino = parametros[nome];

          destino.valores.push(metrica?.valor ?? null);
          destino.valores_brutos.push(
            metrica?.valor_bruto ?? null,
          );
          destino.situacoes.push(
            metrica?.situacao ?? null,
          );
          destino.unidades.push(
            metrica?.unidade_medida ?? null,
          );

          if (metrica) {
            destino.limite_min = metrica.limite_min;
            destino.limite_max = metrica.limite_max;
          }
        }
      }

      return {
        componente,
        horarios: selecionados.map(
          (registro) => registro.timestamp,
        ),
        parametros,
      };
    },
  );
}
   function normalizarSituacao(situacao) {
   if (!situacao) return null;

   return String(situacao)
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .toLowerCase();
  }

function obterPeriodo(periodo, agora = new Date()) {
  const dias = {
    atual: 1,
    "7d": 7,
    "15d": 15,
    "30d": 30,
  };

  if (!(periodo in dias)) {
    throw new ErroValidacao(
      "Período inválido. Use atual, 7d, 15d ou 30d.",
    );
  }

  const fuso = fusoEtlHoras();
  const diasPeriodo = dias[periodo];

  // Ajusta a data para o fuso utilizado pelo ETL
  const dataLocalEtl = new Date(
    agora.getTime() + fuso * 3_600_000,
  );

  // Início do dia no fuso do ETL
  const inicioLocal = new Date(
    Date.UTC(
      dataLocalEtl.getUTCFullYear(),
      dataLocalEtl.getUTCMonth(),
      dataLocalEtl.getUTCDate(),
    ),
  );

  inicioLocal.setUTCDate(
    inicioLocal.getUTCDate() - (diasPeriodo - 1),
  );

  // Retorna para UTC
  const inicio = new Date(
    inicioLocal.getTime() - fuso * 3_600_000,
  );

  return {
    inicio,
    fim: agora,
    dias: diasPeriodo,
  };
}

function prefixosDoPeriodo(
  periodo,
  agora = new Date(),
) {
  const { inicio, fim } = obterPeriodo(periodo);
  const fuso = fusoEtlHoras();

  const prefixos = [];

  // Converte os limites para o horário do ETL
  const cursor = new Date(
    inicio.getTime() + fuso * 3_600_000,
  );

  const finalLocal = new Date(
    fim.getTime() + fuso * 3_600_000,
  );

  // Começa no início da hora
  cursor.setUTCMinutes(0, 0, 0);

  while (cursor.getTime() <= finalLocal.getTime()) {
    prefixos.push(
      `${PASTA_GOLD}` +
        `ano=${cursor.getUTCFullYear()}/` +
        `mes=${doisDigitos(cursor.getUTCMonth() + 1)}/` +
        `dia=${doisDigitos(cursor.getUTCDate())}/` +
        `hora=${doisDigitos(cursor.getUTCHours())}/`,
    );

    // Próxima hora
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }

  return [...new Set(prefixos)];
}

function converterTimestampETL(timestamp) {
  if (!timestamp) return null;

  // Se já possui timezone explícito, utiliza diretamente
  if (
    typeof timestamp === "string" &&
    /Z$|[+-]\d{2}:\d{2}$/.test(timestamp)
  ) {
    const data = new Date(timestamp);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const match = String(timestamp).match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
  );

  if (!match) return null;

  const [
    ,
    ano,
    mes,
    dia,
    hora,
    minuto,
    segundo,
    milissegundo = "0",
  ] = match;

  const fuso = fusoEtlHoras();

  return new Date(
    Date.UTC(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora) - fuso,
      Number(minuto),
      Number(segundo),
      Number(milissegundo.padEnd(3, "0").slice(0, 3)),
    ),
  );
}

function registroDentroDoPeriodo(
  registro,
  inicio,
  fim,
) {
  const timestamp = converterTimestampETL(
    registro.timestamp,
  );

  if (!timestamp) return false;

  return timestamp >= inicio && timestamp <= fim;
}

function contarSituacoes(registros) {
  const resultado = Object.fromEntries(
    COMPONENTES.map((nome) => [
      nome,
      {
        alerta: 0,
        critico: 0,
        total: 0,
      },
    ]),
  );

  for (const registro of registros) {
    const componentes =
      registro.componentes ?? {};

    for (const nome of COMPONENTES) {
      const componente = componentes[nome];

      if (!componente) continue;

      const situacao = normalizarSituacao(
        componente.situacao,
      );

      if (
        situacao !== "alerta" &&
        situacao !== "critico"
      ) {
        continue;
      }

      resultado[nome][situacao]++;
      resultado[nome].total++;
    }
  }

  return resultado;
}

async function alertasComponentes(
    embarcados,
    periodo = "atual",
  ) {
    if (!["atual", "7d", "15d", "30d"].includes(periodo)) {
      throw new ErroValidacao(
        "Período inválido. Use atual, 7d, 15d ou 30d.",
      );
    }

    const { inicio, fim } = obterPeriodo(periodo);

    const prefixoTeste =
      "03-gold/ano=2026/mes=11/dia=21/";

    const testeS3 = await s3.listObjects(prefixoTeste);

    console.log("[TESTE S3] Prefixo diário:", prefixoTeste);
    console.log("[TESTE S3] Resultado:", testeS3);
    console.log("[TESTE S3] Quantidade:", testeS3?.length);
    const prefixos = prefixosDoPeriodo(periodo);

    // Lista os arquivos de cada dia.
    const objetosPorPrefixo = await mapaComLimite(
      prefixos,
      5,
      async (prefixo) => s3.listObjects(prefixo),
    );

    const objetos = objetosPorPrefixo.flat();
    console.log("[Gold Alertas] Prefixos:", prefixos);
    console.log("[Gold Alertas] Objetos encontrados:", objetos.length);
    console.log(
      "[Gold Alertas] Arquivos:",
      objetos.map((objeto) => objeto.Key),
    );

    // Mapeia os MACs para os servidores cadastrados
    const embarcadosNormalizados = embarcados.map(
      (embarcado) => ({
        ...embarcado,
        macNormalizado: normalizarMac(
          embarcado.endereco_mac,
        ),
      }),
    );

    const macs = new Set(
      embarcadosNormalizados.map(
        (embarcado) => embarcado.macNormalizado,
      ),
    );

    // Seleciona apenas arquivos dos servidores solicitados
    const objetosFiltrados = objetos.filter(
      (objeto) => {
        const nomeArquivo = objeto.Key.split("/").pop();

        return [...macs].some((mac) =>
          nomeArquivo.startsWith(`${mac}_`),
        );
      },
    );
    console.log(
      "[Gold Alertas] Arquivos filtrados por MAC:",
      objetosFiltrados.length,
    );

    const registrosPorArquivo =
      await mapaComLimite(
        objetosFiltrados,
        8,
        async (objeto) => {
          const conteudo = await s3.getObject(
            objeto.Key,
          );

          return normalizarRegistros(conteudo);
        },
      );

    const registros = ordenarRegistros(
      registrosPorArquivo
        .flat()
        .filter((registro) =>
          registroDentroDoPeriodo(
            registro,
            inicio,
            fim,
          ),
        ),
    );

    // Evita duplicidade de timestamp por servidor
    const registrosUnicos = new Map();

    for (const registro of registros) {
      const mac = normalizarMac(
        registro.endereco_mac,
      );

      const chave = `${mac}|${registro.timestamp}`;

      registrosUnicos.set(chave, registro);
    }

    const registrosFinal = [
      ...registrosUnicos.values(),
    ];

    console.log(
      "[Gold Alertas] Registros dentro do período:",
      registrosFinal.length,
    );

    console.log(
      "[Gold Alertas] Situações encontradas:",
      registrosFinal.map((registro) => ({
        timestamp: registro.timestamp,
        mac: registro.endereco_mac,
        cpu: registro.componentes?.cpu?.situacao,
        ram: registro.componentes?.ram?.situacao,
        disco: registro.componentes?.disco?.situacao,
        rede: registro.componentes?.rede?.situacao,
      })),
    );

    const contagem = contarSituacoes(
      registrosFinal,
    );

    const totalAlertas = COMPONENTES.reduce(
      (total, componente) =>
        total + contagem[componente].total,
      0,
    );

    return {
      periodo,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      total_alertas: totalAlertas,
      componentes: COMPONENTES.map((nome) => ({
        nome,
        ...contagem[nome],
      })),
    };
  }

  const PASTA_FALHAS_TRAFEGO = (
  process.env.GOLD_FALHAS_TRAFEGO_PREFIXO ?? "03-gold/falhas_com_trafego/"
).replace(/\/?$/, "/");

const NOMES_COMPONENTES_EXIBICAO = {
  cpu: "CPU",
  ram: "Memória RAM",
  swap: "Memória SWAP",
  disco: "Disco",
  rede: "Rede",
};

function obterPeriodoExposicao(periodo, agora = new Date()) {
  const fuso = fusoEtlHoras();
  const dataLocalEtl = new Date(agora.getTime() + fuso * 3_600_000);

  let inicioLocal;
  let dias;

  if (periodo === "mes-atual") {
    inicioLocal = new Date(
      Date.UTC(dataLocalEtl.getUTCFullYear(), dataLocalEtl.getUTCMonth(), 1),
    );
    dias = dataLocalEtl.getUTCDate();
  } else {
    const mapaDias = {
      atual: 1,
      "7d": 7,
      "15d": 15,
      "30d": 30,
    };

    if (!(periodo in mapaDias)) {
      throw new ErroValidacao(
        "Período inválido. Use mes-atual, atual, 7d, 15d ou 30d.",
      );
    }

    dias = mapaDias[periodo];
    inicioLocal = new Date(
      Date.UTC(
        dataLocalEtl.getUTCFullYear(),
        dataLocalEtl.getUTCMonth(),
        dataLocalEtl.getUTCDate(),
      ),
    );
    inicioLocal.setUTCDate(inicioLocal.getUTCDate() - (dias - 1));
  }

  const inicio = new Date(inicioLocal.getTime() - fuso * 3_600_000);
  return { inicio, fim: agora, dias };
}

function prefixosDiariosFalhas(prefixoBase, inicio, fim) {
  const fuso = fusoEtlHoras();
  const cursor = new Date(inicio.getTime() + fuso * 3_600_000);
  const finalLocal = new Date(fim.getTime() + fuso * 3_600_000);

  cursor.setUTCHours(0, 0, 0, 0);

  const prefixos = [];
  while (cursor.getTime() <= finalLocal.getTime()) {
    prefixos.push(
      `${prefixoBase}` +
        `ano=${cursor.getUTCFullYear()}/` +
        `mes=${doisDigitos(cursor.getUTCMonth() + 1)}/` +
        `dia=${doisDigitos(cursor.getUTCDate())}/`,
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return [...new Set(prefixos)];
}

function formatarDuracaoMinutos(totalMinutos) {
  const mins = Math.max(0, Math.round(totalMinutos));
  const horas = Math.floor(mins / 60);
  const resto = mins % 60;

  if (horas === 0) return `${resto}min acumulados no período`;
  if (resto === 0) return `${horas}h acumulados no período`;
  return `${horas}h ${doisDigitos(resto)}min acumulados no período`;
}

function formatarNumeroPtBr(valor) {
  return Math.round(valor || 0).toLocaleString("pt-BR");
}

async function exposicao(embarcados, periodo = "mes-atual") {
  const { inicio, fim } = obterPeriodoExposicao(periodo);

  const macsEmpresa = new Map();
  for (const emb of embarcados) {
    try {
      const mac = normalizarMac(emb.endereco_mac);
      macsEmpresa.set(mac, {
        portico:
          emb.apelido || emb.nome || `EMB-${emb.id_embarcado}`,
        specs: {
          host: emb.hostname || emb.apelido || `SRV-${emb.id_embarcado}`,
          cpu: emb.cpu_info || emb.cpu || "-",
          ram: emb.ram_total_gb ? `${emb.ram_total_gb} GB` : emb.ram || "-",
          disco: emb.disco_total_gb
            ? `${emb.disco_total_gb} TB`
            : emb.disco || "-",
        },
      });
    } catch {
      // ignora embarcados sem MAC válido
    }
  }

  const chaveCache = `exposicao|${periodo}|${[...macsEmpresa.keys()].sort().join(",")}`;

  return comCache(chaveCache, async () => {
    const prefixoAtivas = `${PASTA_FALHAS_TRAFEGO}em_andamento/`;
    const prefixosEncerradas = prefixosDiariosFalhas(
      `${PASTA_FALHAS_TRAFEGO}encerradas/`,
      inicio,
      fim,
    );

    // Lista ativas + partições diárias de encerradas em paralelo
    const listasObjetos = await mapaComLimite(
      [prefixoAtivas, ...prefixosEncerradas],
      6,
      async (prefixo) => s3.listObjects(prefixo),
    );

    const objetosJson = listasObjetos
      .flat()
      .filter((obj) => obj.Key?.endsWith(".json"))
      .filter((obj) => {
        const nomeArquivo = obj.Key.split("/").pop();
        return [...macsEmpresa.keys()].some((mac) =>
          nomeArquivo.startsWith(`${mac}_`),
        );
      });

    const arquivosLidos = await mapaComLimite(
      objetosJson,
      8,
      async (obj) => {
        const conteudo = await s3.getObject(obj.Key);
        return Array.isArray(conteudo) ? conteudo : conteudo ? [conteudo] : [];
      },
    );

    const falhas = arquivosLidos.flat().filter((f) => {
      if (!f || !f.endereco_mac || !f.data_inicio) return false;
      const dtInicio = converterTimestampETL(f.data_inicio);
      const dtFim = f.data_fim ? converterTimestampETL(f.data_fim) : fim;
      if (!dtInicio || !dtFim) return false;

      // Mantém falhas que interceptam o período selecionado
      return dtFim >= inicio && dtInicio <= fim;
    });

    // Estruturas de agregação
    let totalGeral = 0;
    let totalComerciais = 0;
    let totalPasseios = 0;
    let totalMotos = 0;
    let totalMinutosIndisponiveis = 0;

    const porPortico = new Map();
    const porPorticoComponente = new Map();
    const porPorticoDia = new Map();

    for (const falha of falhas) {
      let mac;
      try {
        mac = normalizarMac(falha.endereco_mac);
      } catch {
        continue;
      }

      const infoEmb = macsEmpresa.get(mac);
      if (!infoEmb) continue;

      const portico = infoEmb.portico;
      const compChave = String(falha.componente || "outros").toLowerCase();
      const compNome =
        NOMES_COMPONENTES_EXIBICAO[compChave] || compChave.toUpperCase();

      const veiculos = Number(falha.trafego_total) || 0;
      const comerciais = Number(falha.trafego_comercial) || 0;
      const passeios = Number(falha.trafego_passeio) || 0;
      const motos = Number(falha.trafego_moto) || 0;

      const dtInicio = converterTimestampETL(falha.data_inicio);
      const dtFim = falha.data_fim ? converterTimestampETL(falha.data_fim) : fim;
      const inicioEfetivo = dtInicio < inicio ? inicio : dtInicio;
      const fimEfetivo = dtFim > fim ? fim : dtFim;
      const duracaoMin = Math.max(
        0,
        (fimEfetivo.getTime() - inicioEfetivo.getTime()) / 60_000,
      );

      totalGeral += veiculos;
      totalComerciais += comerciais;
      totalPasseios += passeios;
      totalMotos += motos;
      totalMinutosIndisponiveis += duracaoMin;

      // 1. Ranking por pórtico
      porPortico.set(portico, (porPortico.get(portico) || 0) + veiculos);

      // 2. Componentes por pórtico
      const compMap =
        porPorticoComponente.get(portico) || new Map();
      const atualComp = compMap.get(compNome) || {
        componente: compNome,
        veiculos: 0,
        comerciais: 0,
        passeios: 0,
        motos: 0,
        minutos: 0,
        ocorrencias: 0,
        ativas: 0,
        encerradas: 0,
      };

      atualComp.veiculos += veiculos;
      atualComp.comerciais += comerciais;
      atualComp.passeios += passeios;
      atualComp.motos += motos;
      atualComp.minutos += duracaoMin;
      atualComp.ocorrencias += 1;
      if (falha.em_andamento) {
        atualComp.ativas += 1;
      } else {
        atualComp.encerradas += 1;
      }

      compMap.set(compNome, atualComp);
      porPorticoComponente.set(portico, compMap);

      // 3. Evolução diária (DD/MM)
      const fuso = fusoEtlHoras();
      const dtLocal = new Date(dtInicio.getTime() + fuso * 3_600_000);
      const diaChave = `${doisDigitos(dtLocal.getUTCDate())}/${doisDigitos(
        dtLocal.getUTCMonth() + 1,
      )}`;
      const ordemDia = dtLocal.toISOString().slice(0, 10);

      const diaMap = porPorticoDia.get(portico) || new Map();
      const atualDia = diaMap.get(ordemDia) || {
        data: diaChave,
        total: 0,
        comerciais: 0,
      };
      atualDia.total += veiculos;
      atualDia.comerciais += comerciais;
      diaMap.set(ordemDia, atualDia);
      porPorticoDia.set(portico, diaMap);
    }

    // Ordena ranking decrescente
    const ranking = [...porPortico.entries()]
      .map(([portico, veiculos]) => ({ portico, veiculos }))
      .sort((a, b) => b.veiculos - a.veiculos);

    const maiorPortico = ranking.length > 0 ? ranking[0].portico : "-";

    // Cobertura operacional estimada no período
    const minutosTotaisPeriodo =
      Math.max(1, macsEmpresa.size) *
      ((fim.getTime() - inicio.getTime()) / 60_000);
    const pctCobertura = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((minutosTotaisPeriodo - totalMinutosIndisponiveis) /
            minutosTotaisPeriodo) *
            100,
        ),
      ),
    );

    // Monta hardwarePorPortico e evolucaoPorPortico
    const hardwarePorPortico = {};
    const evolucaoPorPortico = {};

    for (const infoEmb of macsEmpresa.values()) {
      const portico = infoEmb.portico;
      const compMap = porPorticoComponente.get(portico) || new Map();

      const componentes = [...compMap.values()]
        .sort((a, b) => b.veiculos - a.veiculos)
        .map((c) => {
          const mediaMin =
            c.ocorrencias > 0 ? Math.round(c.minutos / c.ocorrencias) : 0;

          return {
            componente: c.componente,
            veiculos: c.veiculos,
            detalhes: {
              comerciais: c.comerciais,
              passeios: c.passeios,
              motos: c.motos,
            },
            tempoAlerta: formatarDuracaoMinutos(c.minutos),
            frequencia: `${c.ocorrencias} ocorrência(s) (média de ${mediaMin} min)`,
            severidade: `Encerradas (${c.encerradas}x) vs. Em andamento (${c.ativas}x)`,
          };
        });

      hardwarePorPortico[portico] = {
        specs: infoEmb.specs,
        componentes,
      };

      const diaMap = porPorticoDia.get(portico) || new Map();
      evolucaoPorPortico[portico] = [...diaMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, ponto]) => ponto);
    }

    return {
      resumo: {
        total: formatarNumeroPtBr(totalGeral),
        comerciais: formatarNumeroPtBr(totalComerciais),
        passeios: formatarNumeroPtBr(totalPasseios),
        motos: formatarNumeroPtBr(totalMotos),
        maiorPortico,
        cobertura: `${pctCobertura}%`,
      },
      ranking,
      hardwarePorPortico,
      evolucaoPorPortico,
    };
  });
}

module.exports = {
  COMPONENTES,
  ErroValidacao,
  normalizarMac,
  prefixosDasUltimasHoras,
  extrairMetricas,
  montarSnapshot,
  mapaComLimite,
  ultimoSnapshot,
  serie,
  alertasComponentes,
  exposicao,
  limparCache,
};