
"use strict";

const s3 = require("./s3Service");

// ---------- configurações ----------

const COMPONENTES = ["cpu", "ram", "disco", "rede"];

const PASTA_GOLD = (process.env.GOLD_PREFIXO ?? "03-gold/").replace(/\/?$/, "/");

const HORAS_ATRAS = Number(process.env.GOLD_HORAS_ATRAS ?? 3);

const TTL_MS = Number(process.env.GOLD_CACHE_SEGUNDOS ?? 15) * 1000;

const JANELA_RECENTE_MS =
  Number(process.env.GOLD_JANELA_CAPTURA_MIN ?? 60) * 60_000;

const MAX_ARQUIVOS = Number(process.env.GOLD_MAX_ARQUIVOS ?? 100);

class ErroValidacao extends Error {}

// Padrão: assume o mesmo fuso deste servidor.
// Se a ETL roda em outro fuso, defina GOLD_FUSO_ETL_HORAS.
// Exemplo: 0 = UTC, -3 = Brasília.
function fusoEtlHoras() {
  const definido = process.env.GOLD_FUSO_ETL_HORAS;

  if (definido !== undefined && definido !== "") {
    return Number(definido);
  }

  return -new Date().getTimezoneOffset() / 60;
}

// O MAC no banco tem ":" e no S3 não.
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

// Um prefixo por hora, da hora atual para trás.
function prefixosDasUltimasHoras(
  mac,
  componente,
  { agora = new Date(), horas = HORAS_ATRAS } = {},
) {
  const fuso = fusoEtlHoras();
  const prefixos = [];

  for (let atras = 0; atras < horas; atras++) {
    const d = new Date(agora.getTime() + (fuso - atras) * 3_600_000);

    prefixos.push(
      `${PASTA_GOLD}ano=${d.getUTCFullYear()}/mes=${doisDigitos(
        d.getUTCMonth() + 1,
      )}` +
        `/dia=${doisDigitos(d.getUTCDate())}/hora=${doisDigitos(
          d.getUTCHours(),
        )}` +
        `/componente=${componente}/${mac}_`,
    );
  }

  return prefixos;
}

// ---------- cache ----------

const cache = new Map();

function comCache(chave, fn) {
  const item = cache.get(chave);

  if (item && item.expira > Date.now()) {
    return item.promessa;
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

// ---------- conversão de valores ----------

const numero = (v) =>
  v === null || v === undefined || Number.isNaN(Number(v))
    ? null
    : Number(v);

// A Lambda grava 0.0 quando não há limite cadastrado.
const limite = (v) => {
  const n = numero(v);
  return n && n > 0 ? n : null;
};

// ---------- conversão: formato da Lambda -> formato do front ----------

function parametro(nome, metrica, { porcentagem = false } = {}) {
  if (!metrica) return null;

  return {
    nome,
    valor: numero(porcentagem ? metrica.valor_pct : metrica.valor),
    situacao: metrica.situacao ?? null,
    limite_min: limite(metrica.limite_min),
    limite_max: limite(metrica.limite_max),
  };
}

function converterComponentes(leitura) {
  const c = leitura.componentes ?? {};

  const grupos = {
    cpu: [
      parametro("cpu_uso_pct", c.cpu?.metricas?.uso),
      parametro("cpu_freq_mhz", c.cpu?.metricas?.freq),
    ],

    ram: [
      parametro("ram_uso_pct", c.ram?.metricas?.uso, {
        porcentagem: true,
      }),
      parametro("swap_uso_pct", c.swap?.metricas?.uso, {
        porcentagem: true,
      }),
    ],

    disco: [
      parametro("disco_uso_pct", c.disco?.metricas?.uso, {
        porcentagem: true,
      }),
    ],

    rede: [
      parametro("download_mbps", c.rede?.metricas?.download),
      parametro("upload_mbps", c.rede?.metricas?.upload),
      parametro("latencia_ms", c.rede?.metricas?.latencia),
    ],
  };

  const resultado = {};

  for (const [grupo, parametros] of Object.entries(grupos)) {
    const validos = parametros.filter(Boolean);

    if (validos.length > 0) {
      resultado[grupo] = {
        nome: grupo,
        endereco_mac: leitura.endereco_mac,
        timestamp: leitura.timestamp,
        parametros: validos,
      };
    }
  }

  return resultado;
}

function extrairSistema(leitura) {
  const c = leitura.componentes ?? {};

  return {
    cpu_nucleos_fisicos: numero(c.cpu?.qtd_nucleos_fisicos),
    cpu_nucleos_logicos: numero(c.cpu?.qtd_nucleos_logicos),
    ram_total_gb: numero(c.ram?.metricas?.uso?.total),
    swap_total_gb: numero(c.swap?.metricas?.uso?.total),
    disco_total_gb: numero(c.disco?.metricas?.uso?.total),
  };
}

// ---------- situação ----------

function nivelDe(situacao) {
  if (!situacao) return null;

  const nivel = String(situacao)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return ["critico", "alerta", "normal"].includes(nivel)
    ? nivel
    : null;
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

// Monta um retrato único do servidor.
function montarSnapshot(snapshot = {}) {
  const alertas = [];
  let pior = null;

  const timestamp = snapshot.timestamp ?? null;
  const componentes = snapshot.componentes ?? {};

  for (const [grupo, componente] of Object.entries(componentes)) {
    const metricas = componente.metricas ?? {};
    const parametros = componente.parametros ?? [];

    // Aceita tanto o formato metricas quanto o formato parametros.
    const listaMetricas = [
      ...Object.entries(metricas).map(([chave, metrica]) => ({
        chave,
        ...metrica,
      })),

      ...parametros.map((metrica) => ({
        chave: metrica.nome,
        ...metrica,
      })),
    ];

    for (const metrica of listaMetricas) {
      const nivel = nivelDe(metrica.situacao);

      if (!nivel) continue;

      if (!pior || PESO[nivel] > PESO[pior]) {
        pior = nivel;
      }

      if (nivel !== "normal") {
        alertas.push({
          componente: grupo,
          parametro: metrica.nome ?? metrica.chave,
          valor: metrica.valor_pct ?? metrica.valor,
          limite_min: metrica.limite_min,
          limite_max: metrica.limite_max,
          situacao: metrica.situacao,
          nivel,
          momento: timestamp ?? componente.timestamp ?? null,
        });
      }
    }

    const nivelComponente = nivelDe(componente.situacao);

    if (
      nivelComponente &&
      (!pior || PESO[nivelComponente] > PESO[pior])
    ) {
      pior = nivelComponente;
    }
  }

  alertas.sort((a, b) => PESO[b.nivel] - PESO[a.nivel]);

  return {
    status: pior ? STATUS_NUMERICO[pior] : null,
    nivel: pior ?? "sem_dados",
    ultima_leitura: timestamp,
    componentes,
    alertas,
  };
}

// ---------- leitura do S3 ----------

function carregarLeituras(empresaId) {
  const empresa = Number(empresaId);

  return comCache(`leituras|${empresa}`, async () => {
    const arquivos = (await s3.listObjects(PASTA_GOLD))
      .filter((o) => /\.jsonl?$/i.test(o.Key))
      .sort(
        (a, b) =>
          new Date(b.LastModified) - new Date(a.LastModified),
      )
      .slice(0, MAX_ARQUIVOS);

    const lotes = await mapaComLimite(
      arquivos,
      4,
      async (arquivo) => {
        const linhas = (await s3.getJsonLines(arquivo.Key)) ?? [];

        return linhas
          .filter(
            (l) =>
              l &&
              l.timestamp &&
              Number(l.id_empresa) === empresa,
          )
          .map((l) => ({
            ...l,
            _chegou_em: new Date(arquivo.LastModified),
          }));
      },
    );

    return lotes.flat();
  });
}

function agruparPorEmbarcado(leituras) {
  const mapa = new Map();

  for (const leitura of leituras) {
    const id = Number(leitura.id_embarcado);

    if (!Number.isFinite(id)) continue;

    if (!mapa.has(id)) {
      mapa.set(id, []);
    }

    mapa.get(id).push(leitura);
  }

  for (const lista of mapa.values()) {
    lista.sort(
      (a, b) =>
        String(a.timestamp).localeCompare(String(b.timestamp)) ||
        a._chegou_em - b._chegou_em,
    );
  }

  return mapa;
}

function construirSnapshot(lista) {
  if (!lista || lista.length === 0) {
    return {
      ...montarSnapshot({}),
      ip: null,
      sistema: null,
      leituras_recentes: 0,
      ultimo_arquivo_em: null,
      recente: false,
    };
  }

  const ultima = lista[lista.length - 1];

  return {
    ...montarSnapshot({
      timestamp: ultima.timestamp,
      componentes: converterComponentes(ultima),
    }),

    ip: ultima.ip || null,
    sistema: extrairSistema(ultima),
    leituras_recentes: lista.length,

    ultimo_arquivo_em: ultima._chegou_em
      ? ultima._chegou_em.toISOString()
      : null,

    recente: ultima._chegou_em
      ? Date.now() - ultima._chegou_em.getTime() <= JANELA_RECENTE_MS
      : false,
  };
}

// ---------- consultas ----------

// Snapshot mais recente de um embarcado específico.
async function ultimoSnapshot(empresaId, embarcadoId) {
  const porId = agruparPorEmbarcado(
    await carregarLeituras(empresaId),
  );

  const lista = porId.get(Number(embarcadoId)) ?? [];

  return {
    id_embarcado: Number(embarcadoId),
    ...construirSnapshot(lista),
  };
}

// Resumo de todos os embarcados de uma empresa.
async function resumoEmpresa(empresaId, embarcados = []) {
  return comCache(`resumo|${empresaId}`, async () => {
    const leituras = await carregarLeituras(empresaId);
    const porId = agruparPorEmbarcado(leituras);

    return embarcados.map((embarcado) => {
      const lista =
        porId.get(Number(embarcado.id_embarcado)) ?? [];

      return {
        id_embarcado: embarcado.id_embarcado,
        apelido: embarcado.apelido,
        endereco_mac: embarcado.endereco_mac,
        ...construirSnapshot(lista),
      };
    });
  });
}

// ---------- histórico para os gráficos ----------

function serie(
  macBruto,
  componente,
  { horas = HORAS_ATRAS, maxPontos = 30 } = {},
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
      const listas = await Promise.all(
        prefixosDasUltimasHoras(mac, componente, { horas }).map(
          (p) => s3.listObjects(p),
        ),
      );

      // ano=/mes=/dia=/hora= com zeros à esquerda:
      // ordem alfabética = ordem cronológica.
      const chaves = listas
        .flat()
        .map((o) => o.Key)
        .sort()
        .slice(-maxPontos);

      const jsons = (
        await mapaComLimite(chaves, 8, (chave) =>
          s3.getObject(chave),
        )
      ).filter(Boolean);

      // A ETL pode regravar a mesma leitura.
      // Mantém apenas um ponto por timestamp.
      const porTimestamp = new Map();

      for (const json of jsons) {
        if (json.timestamp) {
          porTimestamp.set(json.timestamp, json);
        }
      }

      const ordenados = [...porTimestamp.values()].sort(
        (a, b) => a.timestamp.localeCompare(b.timestamp),
      );

      const nomes = [
        ...new Set(
          ordenados.flatMap((j) =>
            (j.parametros ?? []).map((p) => p.nome),
          ),
        ),
      ];

      const parametros = Object.fromEntries(
        nomes.map((n) => [
          n,
          {
            limite_min: null,
            limite_max: null,
            valores: [],
            situacoes: [],
          },
        ]),
      );

      for (const json of ordenados) {
        const porNome = new Map(
          (json.parametros ?? []).map((p) => [p.nome, p]),
        );

        for (const nome of nomes) {
          const p = porNome.get(nome);
          const alvo = parametros[nome];

          alvo.valores.push(p?.valor ?? null);
          alvo.situacoes.push(p?.situacao ?? null);

          if (p) {
            alvo.limite_min = p.limite_min;
            alvo.limite_max = p.limite_max;
          }
        }
      }

      return {
        componente,
        horarios: ordenados.map((j) => j.timestamp),
        parametros,
      };
    },
  );
}

// ---------- exports ----------

module.exports = {
  COMPONENTES,
  ErroValidacao,
  converterComponentes,
  montarSnapshot,
  mapaComLimite,
  ultimoSnapshot,
  resumoEmpresa,
  serie,
  limparCache,
};
