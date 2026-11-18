"use strict";

const gold = require("../service/goldService");
const embarcadoModel = require("../models/embarcadoModel");

function inteiroEntre(valor, padrao, min, max) {
  const n = Number.parseInt(valor, 10);
  return Number.isNaN(n) ? padrao : Math.min(max, Math.max(min, n));
}

function responderErro(res, error, contexto) {
  if (error instanceof gold.ErroValidacao) {
    return res.status(422).json({ message: error.message });
  }

  console.error(`[goldController] ${contexto}:`, error.message || error);
  return res
    .status(502)
    .json({ message: "Não foi possível obter os dados do S3 no momento." });
}

// só devolve o servidor se ele for da empresa do usuário logado.
async function carregarEmbarcado(req, res) {
  const { empresa_id } = req.usuario;
  const { embarcadoId } = req.params;

  const existe = await embarcadoModel.existePorId(empresa_id, embarcadoId);
  if (!existe) {
    res
      .status(404)
      .json({ message: "Nenhum Servidor encontrado para o ID informado." });
    return null;
  }

  const { data } = await embarcadoModel.buscarPorId(empresa_id, embarcadoId);
  return data;
}

// GET /api/gold/embarcados/:embarcadoId
async function snapshot(req, res) {
  try {
    const embarcado = await carregarEmbarcado(req, res);
    if (!embarcado) return;

    const result = await gold.ultimoSnapshot(embarcado.endereco_mac);

    res.status(200).json({
      message:
        result.nivel === "sem_dados"
          ? "Nenhum dado recente encontrado para este Servidor."
          : "Dados encontrados.",
      result,
    });
  } catch (error) {
    responderErro(res, error, "snapshot");
  }
}

// GET /api/gold/embarcados/:embarcadoId/serie?componente=cpu&horas=3&pontos=30
async function serie(req, res) {
  const { componente } = req.query;

  if (!gold.COMPONENTES.includes(componente)) {
    return res.status(400).json({
      message: `O parâmetro 'componente' é obrigatório. Use: ${gold.COMPONENTES.join(", ")}.`,
    });
  }

  try {
    const embarcado = await carregarEmbarcado(req, res);
    if (!embarcado) return;

    const result = await gold.serie(embarcado.endereco_mac, componente, {
      horas: inteiroEntre(req.query.horas, undefined, 1, 24),
      maxPontos: inteiroEntre(req.query.pontos, 30, 1, 200),
    });

    res.status(200).json({ message: "Série encontrada.", result });
  } catch (error) {
    responderErro(res, error, "serie");
  }
}

// GET /api/gold/resumo
async function resumo(req, res) {
  const { empresa_id } = req.usuario;

  try {
    const { data: embarcados } = await embarcadoModel.buscar(empresa_id);

    const servidores = await gold.mapaComLimite(embarcados, 4, async (embarcado) => {
      try {
        const s = await gold.ultimoSnapshot(embarcado.endereco_mac);
        return {
          id_embarcado: embarcado.id_embarcado,
          status: s.status,
          nivel: s.nivel,
          ultima_leitura: s.ultima_leitura,
          alertas: s.alertas,
        };
      } catch (error) {
        console.error(
          `[goldController] resumo falhou para embarcado ${embarcado.id_embarcado}:`,
          error.message,
        );
        return {
          id_embarcado: embarcado.id_embarcado,
          status: null,
          nivel: "sem_dados",
          ultima_leitura: null,
          alertas: [],
        };
      }
    });

    const contar = (nivel) => servidores.filter((s) => s.nivel === nivel).length;
    const todosAlertas = servidores.flatMap((s) => s.alertas);

    res.status(200).json({
      message: "Resumo gerado com sucesso.",
      result: {
        servidores,
        totais: {
          controlado: contar("normal"),
          alerta: contar("alerta"),
          critico: contar("critico"),
          sem_dados: contar("sem_dados"),
          total: servidores.length,
        },
        alertas: {
          amarelo: todosAlertas.filter((a) => a.nivel === "alerta").length,
          vermelho: todosAlertas.filter((a) => a.nivel === "critico").length,
          total: todosAlertas.length,
        },
        atualizado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    responderErro(res, error, "resumo");
  }
}

module.exports = { snapshot, serie, resumo };
