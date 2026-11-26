"use strict";

const s3 = require("./s3Service");

const COMPONENTES = ["cpu", "ram", "disco", "rede"];

const PASTA_GOLD = (process.env.GOLD_PREFIXO ?? "03-gold/metricas/").replace(/\/?$/, "/");
const HORAS_ATRAS = Number(process.env.GOLD_HORAS_ATRAS ?? 3);
const TTL_MS = Number(process.env.GOLD_CACHE_SEGUNDOS ?? 15) * 1000;
const DEFAULT_EXPECTED_PER_HOUR = Number(process.env.GOLD_EXPECTED_PER_HOUR ?? 12); // default: uma leitura a cada 5 minutos
const HORAS_DISP = Number(process.env.GOLD_DISP_HORAS ?? HORAS_ATRAS);

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

// Um prefixo por hora, da hora atual para trás. Os JSONL agora guardam todos
// os componentes juntos, então basta filtrar pelo MAC no nome do arquivo.
function prefixosDasUltimasHoras(mac, { agora = new Date(), horas = HORAS_ATRAS } = {}) {
  const fuso = fusoEtlHoras();
  const prefixos = [];

  for (let atras = 0; atras < horas; atras++) {
    // Converte a hora atual para o fuso da ETL e volta uma hora por iteração.
    const d = new Date(agora.getTime() + fuso * 3_600_000 - atras * 3_600_000);
    prefixos.push(
      `${PASTA_GOLD}ano=${d.getUTCFullYear()}/mes=${doisDigitos(d.getUTCMonth() + 1)}` +
        `/dia=${doisDigitos(d.getUTCDate())}/hora=${doisDigitos(d.getUTCHours())}` +
        `/${mac}_`,
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

// Resume o snapshot JSONL no formato usado pelos endpoints atuais.
function montarSnapshot(snapshot) {
  if (!snapshot) {
    return {
      status: null,
      nivel: "sem_dados",
      ultima_leitura: null,
      componentes: {},
      alertas: [],
    };
  }

  const alertas = [];
  let pior = null;
  const timestamp = snapshot.timestamp ?? null;
  const componentes = snapshot.componentes ?? {};

  for (const [grupo, componente] of Object.entries(componentes)) {
    const metricas = componente.metricas ?? {};
    for (const [chave, metrica] of Object.entries(metricas)) {
      const nivel = nivelDe(metrica.situacao);
      if (!nivel) continue;

      if (!pior || PESO[nivel] > PESO[pior]) pior = nivel;

      if (nivel !== "normal") {
        alertas.push({
          componente: grupo,
          parametro: metrica.nome ?? chave,
          valor: metrica.valor_pct ?? metrica.valor,
          limite_min: metrica.limite_min,
          limite_max: metrica.limite_max,
          situacao: metrica.situacao,
          nivel,
          momento: timestamp,
        });
      }
    }

    const nivelComponente = nivelDe(componente.situacao);
    if (nivelComponente && (!pior || PESO[nivelComponente] > PESO[pior])) {
      pior = nivelComponente;
    }
  }

  alertas.sort((a, b) => PESO[b.nivel] - PESO[a.nivel]);

  return {
    status: pior ? STATUS_NUMERICO[pior] : null, // null = sem dados
    nivel: pior ?? "sem_dados",
    ultima_leitura: timestamp,
    componentes,
    alertas,
    ip: snapshot?.ip ?? null,
  };
}

// Calcula a porcentagem de horas com pelo menos uma leitura nas últimas `horas` horas.
function disponibilidadePorHoras(snapshots, horas = HORAS_ATRAS) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return 0;

  const horasSet = new Set();
  for (const s of snapshots) {
    if (!s?.timestamp) continue;
    const d = new Date(s.timestamp);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${d.getUTCHours()}`;
    horasSet.add(key);
  }

  const presentes = horasSet.size;
  const pct = Math.round((presentes / horas) * 100);
  return Math.max(0, Math.min(100, pct));
}

// Calcula disponibilidade baseada em leituras recebidas vs esperadas.
// expectedPerHour = leituras esperadas por hora (ex: 12 = 1 leitura a cada 5 minutos)
function disponibilidadePorEsperado(snapshots, horas = HORAS_DISP, expectedPerHour = DEFAULT_EXPECTED_PER_HOUR) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return 0.0;

  const now = Date.now();
  const cutoff = now - horas * 3_600_000;

  const eps = Number(expectedPerHour) || DEFAULT_EXPECTED_PER_HOUR;
  // janela em ms por slot esperado
  const windowMs = Math.max(1_000, Math.floor(3_600_000 / eps));

  const slots = new Set();
  for (const s of snapshots) {
    if (!s?.timestamp) continue;
    const t = new Date(s.timestamp).getTime();
    if (t < cutoff) continue;
    slots.add(Math.floor(t / windowMs));
  }

  const presentes = slots.size;
  const esperados = Math.max(1, Math.round(horas * eps));
  const raw = (presentes / esperados) * 100;
  const pct = Math.max(0, Math.min(100, raw));
  // uma casa decimal
  return Math.round(pct * 10) / 10;
}

// ---------- consultas ----------

function normalizarSnapshots(dados) {
  const snapshots = Array.isArray(dados)
    ? dados
    : dados && typeof dados === "object"
      ? [dados]
      : [];

  return snapshots.map(normalizarSnapshot);
}

function situacaoPorLimites(valor, metrica) {
  const limiteMin = Number(metrica.limite_min);
  const limiteMax = Number(metrica.limite_max);

  if (limiteMin > 0 && valor <= limiteMin) return "Crítico";
  if (limiteMax > 0) {
    if (valor >= limiteMax) return "Crítico";
    if (valor >= 0.7 * limiteMax) return "Alerta";
  }
  return "Normal";
}

function normalizarSnapshot(snapshot) {
  if (!snapshot?.componentes || typeof snapshot.componentes !== "object") {
    return snapshot;
  }

  const componentes = { ...snapshot.componentes };

  for (const grupo of ["ram", "swap", "disco"]) {
    const componente = componentes[grupo];
    const uso = componente?.metricas?.uso;
    if (
      !uso ||
      typeof uso.valor !== "number" ||
      typeof uso.total !== "number" ||
      uso.total <= 0
    ) {
      continue;
    }

    const percentualAusente =
      uso.valor_pct == null || (uso.valor_pct === 0 && uso.valor > 0);
    if (!percentualAusente) continue;

    const valorPct = (uso.valor / uso.total) * 100;
    if (!Number.isFinite(valorPct) || valorPct > 100) continue;

    const situacao = situacaoPorLimites(valorPct, uso);
    componentes[grupo] = {
      ...componente,
      situacao,
      metricas: {
        ...componente.metricas,
        uso: { ...uso, valor_pct: valorPct, situacao },
      },
    };
  }

  const rede = componentes.rede;
  if (rede?.metricas) {
    const metricas = { ...rede.metricas };
    for (const nome of ["download", "upload", "latencia"]) {
      if (metricas[nome]?.valor === 0) {
        metricas[nome] = {
          ...metricas[nome],
          valor: null,
          situacao: "Normal",
        };
      }
    }

    const pacotes = rede.pacotes
      ? Object.fromEntries(
          Object.entries(rede.pacotes).map(([nome, dados]) => [
            nome,
            dados && typeof dados === "object"
              ? Object.fromEntries(
                  Object.entries(dados).map(([campo, valor]) => [
                    campo,
                    valor === 0 ? null : valor,
                  ]),
                )
              : dados,
          ]),
        )
      : rede.pacotes;

    componentes.rede = { ...rede, metricas, pacotes };
  }

  return { ...snapshot, componentes };
}

// Lê os snapshots JSONL do MAC nas partições horárias solicitadas.
async function carregarSnapshots(mac, horas = HORAS_ATRAS) {
  return comCache(`leituras|${mac}|${horas}`, async () => {
    const listas = await Promise.all(
      prefixosDasUltimasHoras(mac, { horas }).map((prefixo) => s3.listObjects(prefixo)),
    );
    const objetos = listas
      .flat()
      .sort((a, b) => new Date(a.LastModified) - new Date(b.LastModified));
    const porTimestamp = new Map();

    const dados = await mapaComLimite(objetos, 8, (objeto) => s3.getObject(objeto.Key));
    dados.forEach((arquivo) => {
      for (const snapshot of normalizarSnapshots(arquivo)) {
        if (snapshot?.timestamp) porTimestamp.set(snapshot.timestamp, snapshot);
      }
    });

    const snapshots = [...porTimestamp.values()].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );

    const ultimoArquivoEm = objetos.length ? objetos.at(-1).LastModified : null;

    return { snapshots, ultimo_arquivo_em: ultimoArquivoEm };
  });
}

// Último retrato do servidor: cpu, ram, disco e rede + situação geral + alertas.
function ultimoSnapshot(macBruto) {
  const mac = normalizarMac(macBruto);

  return comCache(`snap|${mac}`, async () => {
    const { snapshots, ultimo_arquivo_em } = await carregarSnapshots(mac);
    const snapshot = snapshots.at(-1) ?? null;
    const resultado = montarSnapshot(snapshot);
    if (resultado) {
      resultado.ultimo_arquivo_em = ultimo_arquivo_em ? new Date(ultimo_arquivo_em).toISOString() : null;
      // Disponibilidade: porcentagem de horas com pelo menos uma leitura
      try {
        // calcular disponibilidade baseada em leituras recebidas vs esperadas
        resultado.disponibilidade_percent = disponibilidadePorEsperado(snapshots, HORAS_DISP, DEFAULT_EXPECTED_PER_HOUR);
        // meta para explicar: quantos slots recebidos / esperados
        // recalc slots/esperados for meta
        const windowMs = Math.max(1_000, Math.floor(3_600_000 / DEFAULT_EXPECTED_PER_HOUR));
        const cutoff = Date.now() - HORAS_DISP * 3_600_000;
        const slots = new Set();
        for (const s of snapshots) {
          if (!s?.timestamp) continue;
          const t = new Date(s.timestamp).getTime();
          if (t < cutoff) continue;
          slots.add(Math.floor(t / windowMs));
        }
        const presentes = slots.size;
        const esperados = Math.max(1, Math.round(HORAS_DISP * DEFAULT_EXPECTED_PER_HOUR));
        resultado.disponibilidade_meta = { recebidos: presentes, esperados, horas: HORAS_DISP };
      } catch (err) {
        resultado.disponibilidade_percent = 0;
        resultado.disponibilidade_meta = { recebidos: 0, esperados: HORAS_DISP * DEFAULT_EXPECTED_PER_HOUR, horas: HORAS_DISP };
      }
    }
    return resultado;
  });
}

// Histórico de um componente: um ponto por snapshot, em ordem de tempo.
function serie(macBruto, componente, { horas = HORAS_ATRAS, maxPontos = 30 } = {}) {
  if (!COMPONENTES.includes(componente)) {
    throw new ErroValidacao(`Componente inválido. Use: ${COMPONENTES.join(", ")}.`);
  }
  const mac = normalizarMac(macBruto);

  return comCache(`serie|${mac}|${componente}|${horas}|${maxPontos}`, async () => {
    const { snapshots } = await carregarSnapshots(mac, horas);
    const ordenados = snapshots.slice(-maxPontos);

    return {
      componente,
      horarios: ordenados.map((snapshot) => snapshot.timestamp),
      leituras: ordenados,
    };
  });
}

async function resumoEmpresa(empresaId, embarcados) {
  const servidores = await mapaComLimite(
    Array.isArray(embarcados) ? embarcados : [],
    8,
    async (embarcado) => {
      try {
        const resultado = await ultimoSnapshot(embarcado.endereco_mac);
        return {
          ...embarcado,
          ...resultado,
          recente: resultado.ultima_leitura !== null,
        };
      } catch (error) {
        if (error instanceof ErroValidacao) {
          return {
            ...embarcado,
            ...montarSnapshot(null),
            recente: false,
          };
        }
        throw error;
      }
    },
  );

  return servidores;
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
  resumoEmpresa,
  limparCache,
};
