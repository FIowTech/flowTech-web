const express = require("express");
const embarcadoController = require("../controllers/embarcadoController");

const router = express.Router({ mergeParams: true });

// === GET | Buscar Todos por Empresa === //
router.get("/", function (req, res) {
  embarcadoController.buscar(req, res);
});

// === GET | Buscar por Id === //
router.get("/:embarcadoId", function (req, res) {
  embarcadoController.buscarPorId(req, res);
});

// === POST | Cadastar === //
router.post("/cadastrar", function (req, res) {
  embarcadoController.cadastrar(req, res);
});

// === PUT | Atualizar === //
router.put("/:embarcadoId", function (req, res) {
  embarcadoController.editar(req, res);
});

// === DELETE | Remover === //
router.delete("/:embarcadoId", function (req, res) {
  embarcadoController.remover(req, res);
});

module.exports = router;
