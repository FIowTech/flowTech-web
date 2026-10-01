const crypto = require("node:crypto");

const CARACTERES = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function gerarCodigoAcesso(tamanho = 12) {
  let codigo = "";

  for (let i = 0; i < tamanho; i++) {
    const indiceAleatorio = crypto.randomInt(0, CARACTERES.length);
    codigo += CARACTERES[indiceAleatorio];
  }

  return codigo;
}

module.exports = { gerarCodigoAcesso, CARACTERES };
