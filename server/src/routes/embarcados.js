const express = require("express");
const embarcadoController = require("../controllers/embarcadoController");

const router = express.Router({ mergeParams: true });

// === GET - BUSCA (TODOS) === //
router.get("/", function (req, res) {
  embarcadoController.buscar(req, res);
});

// === GET - BUSCA POR ID === //
router.get("/:embarcadoId", function (req, res) {
  embarcadoController.buscarPorId(req, res);
});

// === POST - CRIAÇÃO === //
router.post("/cadastrar", function (req, res) {
  embarcadoController.cadastrar(req, res);
});

// === PUT - ATUALIZAÇÃO === //
router.put("/:embarcadoId", function (req, res) {
  embarcadoController.editar(req, res);
});

// === DELETE - REMOÇÃO === //
router.delete("/:embarcadoId", function (req, res) {
  embarcadoController.remover(req, res);
});

module.exports = router;
