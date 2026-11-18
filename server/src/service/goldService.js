"use strict";

const s3 = require("./s3Service");

const COMPONENTES = ["cpu", "ram", "disco", "rede"];

const PASTA_GOLD = (process.env.GOLD_PREFIXO ?? "03-gold/").replace(/\/?$/, "/");
const HORAS_ATRAS = Number(process.env.GOLD_HORAS_ATRAS ?? 3);
const TTL_MS = Number(process.env.GOLD_CACHE_SEGUNDOS ?? 15) * 1000;

class ErroValidacao extends Error {}

// Padrão: assume o mesmo fuso deste servidor. Se a ETL roda em outro fuso, defina GOLD_FUSO_ETL_HORAS (0 = UTC, -3 = Brasília).
function fusoEtlHoras() {
  const definido = process.env.GOLD_FUSO_ETL_HORAS;
  if (definido !== undefined && definido !== "") return Number(definido);
  return -new Date().getTimezoneOffset() / 60;
}

// O MAC no banco tem ":" ("5C:CD:5B:E5:3D:E1"); no S3 não ("5CCD5BE53DE1").
function normalizarMac(mac) {
  const limpo = String(mac ?? "").replace(/[:-]/g, "").toUpperCase();
  if (!/^[0-9A-F]{12}$/.test(limpo)) {
    throw new ErroValidacao("Endereço MAC inválido.");
  }
  return limpo;
}

const doisDigitos = (n) => String(n).padStart(2, "0");

// Um prefixo por hora, da hora atual para trás. Termina em "<MAC>_" para listar
// só os arquivos daquele servidor dentro da pasta do grupo.
function prefixosDasUltimasHoras(mac, componente, { agora = new Date(), horas = HORAS_ATRAS } = {}) {
  const fuso = fusoEtlHoras();
  const prefixos = [];

  for (let atras = 0; atras < horas; atras++) {
    // soma o fuso e usa getUTC*: evita depender do fuso do servidor
    const d = new Date(agora.getTime() + (fuso - atras) * 3_600_000);
    prefixos.push(
      `${PASTA_GOLD}ano=${d.getUTCFullYear()}/mes=${doisDigitos(d.getUTCMonth() + 1)}` +
        `/dia=${doisDigitos(d.getUTCDate())}/hora=${doisDigitos(d.getUTCHours())}` +
        `/componente=${componente}/${mac}_`,
    );
  }
  return prefixos;
}

// ---------- cache (evita 1 ida ao S3 a cada refresh/polling do front) ----------

const cache = new Map();

function comCache(chave, fn) {
  const item = cache.get(chave);
  if (item && item.expira > Date.now()) return item.promessa;

  if (cache.size > 1000) {
    for (const [k, v] of cache) if (v.expira <= Date.now()) cache.delete(k);
  }

  const promessa = fn().catch((erro) => {
    cache.delete(chave); // não guarda falhas
    throw erro;
  });
  cache.set(chave, { promessa, expira: Date.now() + TTL_MS });
  return promessa;
}

function limparCache() {
  cache.clear();
}

// Executa fn nos itens, no máximo `limite` ao mesmo tempo.
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
    Array.from({ length: Math.min(limite, lista.length) }, trabalhador),
  );
  return resultados;
}

// ---------- situação ----------

// "Crítico" / "Alerta" / "Normal" (ou null, quando não há limite cadastrado) -> chave sem acento
function nivelDe(situacao) {
  if (!situacao) return null;
  const nivel = String(situacao)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return ["critico", "alerta", "normal"].includes(nivel) ? nivel : null;
}

const PESO = { critico: 3, alerta: 2, normal: 1 };
// Mesma convenção que o front já usa em embarcados-page: 0 crítico | 1 ok | 2 atenção
const STATUS_NUMERICO = { critico: 0, normal: 1, alerta: 2 };

// Junta os JSONs mais recentes de cada grupo em um retrato único do servidor.
function montarSnapshot(componentes) {
  const alertas = [];
  let pior = null;
  let ultimaLeitura = null;

  for (const [grupo, json] of Object.entries(componentes)) {
    if (json.timestamp && (!ultimaLeitura || json.timestamp > ultimaLeitura)) {
      ultimaLeitura = json.timestamp;
    }

    for (const p of json.parametros ?? []) {
      const nivel = nivelDe(p.situacao);
      if (!nivel) continue;

      if (!pior || PESO[nivel] > PESO[pior]) pior = nivel;

      if (nivel !== "normal") {
        alertas.push({
          componente: grupo,
          parametro: p.nome,
          valor: p.valor,
          limite_min: p.limite_min,
          limite_max: p.limite_max,
          situacao: p.situacao,
          nivel,
          momento: json.timestamp,
        });
      }
    }
  }

  alertas.sort((a, b) => PESO[b.nivel] - PESO[a.nivel]);

  return {
    status: pior ? STATUS_NUMERICO[pior] : null, // null = sem dados
    nivel: pior ?? "sem_dados",
    ultima_leitura: ultimaLeitura,
    componentes,
    alertas,
  };
}

// ---------- consultas ----------

// Arquivo mais recente de um grupo para um MAC, olhando as últimas horas.
async function arquivoMaisRecente(mac, componente) {
  const candidatos = await Promise.all(
    prefixosDasUltimasHoras(mac, componente).map((p) => s3.getMostRecentObject(p)),
  );

  return candidatos
    .filter(Boolean)
    .reduce((a, b) => (!a || b.LastModified > a.LastModified ? b : a), null);
}

// Último retrato do servidor: cpu, ram, disco e rede + situação geral + alertas.
function ultimoSnapshot(macBruto) {
  const mac = normalizarMac(macBruto);

  return comCache(`snap|${mac}`, async () => {
    const componentes = {};

    await Promise.all(
      COMPONENTES.map(async (grupo) => {
        const arquivo = await arquivoMaisRecente(mac, grupo);
        if (!arquivo) return;

        const json = await s3.getObject(arquivo.Key);
        if (json) componentes[grupo] = json;
      }),
    );

    return montarSnapshot(componentes);
  });
}

// Histórico de um grupo (para os gráficos): um ponto por arquivo, em ordem de tempo.
function serie(macBruto, componente, { horas = HORAS_ATRAS, maxPontos = 30 } = {}) {
  if (!COMPONENTES.includes(componente)) {
    throw new ErroValidacao(`Componente inválido. Use: ${COMPONENTES.join(", ")}.`);
  }
  const mac = normalizarMac(macBruto);

  return comCache(`serie|${mac}|${componente}|${horas}|${maxPontos}`, async () => {
    const listas = await Promise.all(
      prefixosDasUltimasHoras(mac, componente, { horas }).map((p) => s3.listObjects(p)),
    );

    // ano=/mes=/dia=/hora= com zeros à esquerda: ordem alfabética = ordem cronológica
    const chaves = listas
      .flat()
      .map((o) => o.Key)
      .sort()
      .slice(-maxPontos);

    const jsons = (await mapaComLimite(chaves, 8, (chave) => s3.getObject(chave))).filter(Boolean);

    // a ETL pode regravar a mesma leitura em execuções seguidas: 1 ponto por timestamp
    const porTimestamp = new Map();
    for (const json of jsons) {
      if (json.timestamp) porTimestamp.set(json.timestamp, json);
    }
    const ordenados = [...porTimestamp.values()].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );

    const nomes = [
      ...new Set(ordenados.flatMap((j) => (j.parametros ?? []).map((p) => p.nome))),
    ];
    const parametros = Object.fromEntries(
      nomes.map((n) => [n, { limite_min: null, limite_max: null, valores: [], situacoes: [] }]),
    );

    for (const json of ordenados) {
      const porNome = new Map((json.parametros ?? []).map((p) => [p.nome, p]));

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
      horarios: ordenados.map((j) => j.timestamp), // "2026-11-14 20:09:14"
      parametros,
    };
  });
}

module.exports = {
  COMPONENTES,
  ErroValidacao,
  normalizarMac,
  prefixosDasUltimasHoras,
  montarSnapshot,
  mapaComLimite,
  ultimoSnapshot,
  serie,
  limparCache,
};
