const {
  PERIODOS_VALIDOS,
  TIMEZONE,
  normalizarMac,
  parseTimestampSaoPaulo,
  listarObjetosPorPrefixo,
  lerObjetoTextoPorKey,
  parseJsonSeguro,
} = require("../utils/s3-utils");

const PREFIXO_FALHAS = "03-gold/falhas";

// 7d é específico da fila de alertas; os demais serviços mantêm seus períodos.
const PERIODOS_FALHAS = { ...PERIODOS_VALIDOS, "7d": 7 * 24 };

// Aceita qualquer subpasta (ex.: em_andamento/, encerrado/) dentro de falhas/.
function isChaveValida(key) {
  return key.startsWith(`${PREFIXO_FALHAS}/`) && key.endsWith("_falha.json");
}

// O exemplo do contrato (13:25:20 -> 13:25:58 = "00:38") usa MINUTOS:SEGUNDOS.
function formatarDuracao(inicio, fim) {
  if (!inicio || !fim) return "00:00";

  const inicioMs = inicio.getTime();
  const fimMs = fim.getTime();
  if (Number.isNaN(inicioMs) || Number.isNaN(fimMs)) return "00:00";

  const totalSegundos = Math.max(0, Math.floor((fimMs - inicioMs) / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

function chaveEpisodio(evento) {
  return [
    evento.id_embarcado,
    normalizarMac(evento.endereco_mac),
    evento.componente,
    normalizarSituacao(evento.situacao),
  ].join("|");
}

function normalizarSituacao(situacao) {
  return String(situacao ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function criarEpisodio(evento) {
  const emAndamento = evento.em_andamento === true;

  return {
    id: `${normalizarMac(evento.endereco_mac)}_${evento.componente}_${evento.data_inicio}`,
    id_empresa: evento.id_empresa,
    id_embarcado: evento.id_embarcado,
    endereco_mac: evento.endereco_mac,
    componente: evento.componente,
    situacao: normalizarSituacao(evento.situacao),
    em_andamento: emAndamento,
    data_inicio: evento.data_inicio,
    // data_fim vem do próprio JSON; só muda quando um novo evento chega.
    data_fim: evento.data_fim ?? null,
  };
}

function converterEpisodio(episodio) {
  const inicio = parseTimestampSaoPaulo(episodio.data_inicio);

  if (!episodio.data_fim) {
    return { ...episodio, duracao: "—" };
  }

  const fim = parseTimestampSaoPaulo(episodio.data_fim);
  return {
    ...episodio,
    duracao: formatarDuracao(inicio, fim),
  };
}

async function getAlertas({
  empresa_id,
  periodo = "7d",
  situacao,
  limit = 50,
  offset = 0,
  fim = new Date(),
}) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error(
      "[alertasService] A variável AWS_S3_BUCKET não foi definida.",
    );
  }

  const horasPeriodo = PERIODOS_FALHAS[periodo];
  if (!horasPeriodo) {
    throw new Error(
      "[alertasService] Período inválido. Use: 1h, 24h, 7d, 15d ou 30d.",
    );
  }

  const inicio = new Date(fim.getTime() - horasPeriodo * 60 * 60 * 1000);

  // Listagem genérica: o prefixo pode conter subpastas como em_andamento/.
  const objetos = await listarObjetosPorPrefixo({
    bucket: process.env.AWS_S3_BUCKET,
    prefixo: `${PREFIXO_FALHAS}/`,
    keyFilter: isChaveValida,
  });

  const eventos = [];

  for (const objeto of objetos) {
    if (!objeto.Key) continue;

    const evento = await lerObjetoTextoPorKey({
      bucket: process.env.AWS_S3_BUCKET,
      key: objeto.Key,
    }).then(parseJsonSeguro);

    if (!evento) continue;
    if (String(evento.id_empresa) !== String(empresa_id)) continue;

    const situacaoEvento = normalizarSituacao(evento.situacao);
    // A fila só mostra alerta/crítico; normais não são enviados ao front.
    if (situacaoEvento === "normal") continue;

    if (
      !isMissingSituacao(situacao) &&
      situacaoEvento !== normalizarSituacao(situacao)
    ) {
      continue;
    }

    const dataInicio = parseTimestampSaoPaulo(evento.data_inicio);
    if (!dataInicio || dataInicio < inicio || dataInicio > fim) continue;

    eventos.push({ evento, dataInicio });
  }

  eventos.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());

  const episodios = [];
  const abertos = new Map();

  for (const { evento } of eventos) {
    const chave = chaveEpisodio(evento);
    const aberto = abertos.get(chave);

    if (evento.em_andamento === true) {
      if (aberto) {
        // Continuação: mantém o início original e congela o fim no último JSON.
        aberto.data_fim = evento.data_fim ?? aberto.data_fim;
        continue;
      }

      const episodio = criarEpisodio(evento);
      episodios.push(episodio);
      abertos.set(chave, episodio);
      continue;
    }

    // em_andamento !== true encerra o episódio aberto; não cria um novo.
    if (aberto) {
      aberto.em_andamento = false;
      aberto.data_fim =
        evento.data_fim ?? aberto.data_fim ?? evento.data_inicio;
      abertos.delete(chave);
      continue;
    }

    // Episódio curto que já nasce encerrado.
    episodios.push(criarEpisodio(evento));
  }

  episodios.sort((a, b) => {
    const dataA = parseTimestampSaoPaulo(a.data_inicio);
    const dataB = parseTimestampSaoPaulo(b.data_inicio);
    return (dataB?.getTime() ?? 0) - (dataA?.getTime() ?? 0);
  });

  const total = episodios.length;
  const result = episodios
    .slice(offset, offset + limit)
    .map((episodio) => converterEpisodio(episodio));

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

function isMissingSituacao(valor) {
  return valor === undefined || valor === null || String(valor).trim() === "";
}

module.exports = {
  getAlertas,
  PERIODOS_VALIDOS: Object.keys(PERIODOS_FALHAS),
};
