const express = require("express");
const codigoAcessoController = require("../controllers/codigoAcessoController");

const router = express.Router();

// === POST | Gerar Código de Acesso === //
router.post("/", function (req, res) {
  codigoAcessoController.gerar(req, res);
});

// === GET | Buscar por Usuário por Empresa === //
router.get("/", function (req, res) {
  if (req.query.status) {
    codigoAcessoController.buscarPorStatus(req, res);
  } else {
    codigoAcessoController.buscar(req, res);
  }
});

// === GET | Buscar por Id === //
router.get("/:id_codigo", function (req, res) {
  codigoAcessoController.buscarPorId(req, res);
});

// === PUT | Revogar por Id === //
router.put("/:id_codigo", function (req, res) {
  codigoAcessoController.revogar(req, res);
});

module.exports = router;
