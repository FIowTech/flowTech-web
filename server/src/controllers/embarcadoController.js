const { isMissing } = require("../utils");
const embarcadoModel = require("../models/embarcadoModel");
const empresaModel = require("../models/empresaModel");

async function buscar(req, res) {
  const { empresa_id } = req.usuario;

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .json({ message: "ID da Empresa não foi passado na requisição." });
  }

  try {
    const empresaExiste = await empresaModel.existerPorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const result = await embarcadoModel.buscar(empresa_id);

    res.status(200).json({
      message: "Servidores encontrados para a Empresa solicitada.",
      count: result.length,
      result,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function buscarPorID(req, res) {
  const { empresa_id } = req.usuario;
  const { id } = req.params;

  if (isMissing(empresa_id)) {
    res
      .status(400)
      .json({ message: "ID da Empresa não foi passado na requisição." });
    return;
  }

  if (isMissing(id)) {
    return res
      .status(400)
      .json({ message: "ID do Servidor não foi passado na requisição." });
  }

  try {
    const empresaExiste = await empresaModel.existerPorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const servidorExiste = await embarcadoModel.existerPorId(id);
    if (!servidorExiste) {
      return res
        .status(404)
        .json({ message: "Nenhum Servidor encontrado para o ID informado." });
    }

    const result = await embarcadoModel.buscarPorID(empresa_id, id);

    res.status(200).json({
      message: "Servidor encontrado com sucesso.",
      servidor: result[0],
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function cadastrar(req, res) {
  const { empresa_id, nivel_acesso } = req.usuario;
  const { endereco_id, endereco_mac, apelido, modelo } = req.body;

  // dado que: 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (nivel_acesso > 1) {
    return res
      .status(403)
      .send({ message: "Você não tem permissão para realizar esta ação." });
  }

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .json({ message: "ID da Empresa não foi passado na requisição." });
  }

  if (isMissing(endereco_id)) {
    return res
      .status(400)
      .json({ message: "O campo 'endereco_id' está faltando." });
  }

  if (isMissing(endereco_mac)) {
    return res
      .status(400)
      .json({ message: "O campo 'endereco_mac' está faltando." });
  }

  if (isMissing(apelido)) {
    return res
      .status(400)
      .json({ message: "O campo 'apelido' está faltando." });
  }

  if (isMissing(modelo)) {
    return res.status(400).json({ message: "O campo 'modelo' está faltando." });
  }

  try {
    // 1. Verifica se Empresa informada existe de fato
    const empresaExiste = await empresaModel.existerPorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    // 2. Verifica se Endereco MAC já está em uso
    const enderecoMacEmUso =
      await embarcadoModel.existePorEnderecoMac(endereco_mac);
    if (enderecoMacEmUso) {
      return res
        .status(409)
        .json({ message: "Este endereço MAC já está registrado." });
    }

    // 2. Inicia registro de Servidor
    await embarcadoModel.cadastrar(
      empresa_id,
      endereco_id,
      endereco_mac,
      apelido,
      modelo,
    );

    res.status(201).json({ message: "Servidor cadastrado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function editar(req, res) {
  const { empresa_id } = req.usuario;
  const { id } = req.params;
  const { endereco_mac, apelido, modelo } = req.body;
  const camposParaAtualizar = {};

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .json({ message: "ID da Empresa não foi passado na requisição." });
  }

  if (isMissing(id)) {
    return res
      .status(400)
      .json({ message: "ID do Servidor não foi passado na requisição." });
  }

  try {
    const empresaExiste = await empresaModel.existerPorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const servidorExiste = await embarcadoModel.existerPorId(id);
    if (!servidorExiste) {
      return res
        .status(404)
        .json({ message: "Nenhum Servidor encontrado para o ID informado." });
    }

    if (!isMissing(endereco_mac)) {
      const enderecoMacEmUso =
        await embarcadoModel.existePorEnderecoMac(endereco_mac);
      if (enderecoMacEmUso) {
        const servidorAtual = await embarcadoModel.buscarPorID(empresa_id, id);

        if (servidorAtual[0].endereco_mac !== endereco_mac) {
          return res.status(409).json({
            message:
              "Endereço MAC informado para atualização já está registrado.",
          });
        }
      }

      camposParaAtualizar.endereco_mac = endereco_mac;
    }
    if (!isMissing(apelido)) camposParaAtualizar.apelido = apelido;
    if (!isMissing(modelo)) camposParaAtualizar.modelo = modelo;

    await embarcadoModel.editar(empresa_id, id, camposParaAtualizar);

    res.status(200).json({ message: "Servidor atualizado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function remover(req, res) {
  const { empresa_id, nivel_acesso } = req.usuario;
  const { id } = req.params;

  // dado que: 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (nivel_acesso > 1) {
    return res
      .status(403)
      .json({ message: "Você não tem permissão para realizar esta ação." });
  }

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .json({ message: "ID da Empresa não foi passado na requisição." });
  }

  if (isMissing(id)) {
    return res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
  }

  try {
    const empresaExiste = await empresaModel.existerPorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const servidorExiste = await embarcadoModel.existerPorId(id);
    if (!servidorExiste) {
      return res
        .status(404)
        .json({ message: "Nenhum Servidor encontrado para o ID informado." });
    }

    await embarcadoModel.remover(empresa_id, id);

    res.status(200).send({ message: "Servidor removido com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  cadastrar,
  buscar,
  buscarPorID,
  remover,
  editar,
};
