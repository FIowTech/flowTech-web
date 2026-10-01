const express = require("express");
const empresaController = require("../controllers/empresaController");

const router = express.Router();

// === POST | Cadastrar Empresa === //
router.post("/cadastrar", function (req, res) {
  empresaController.cadastrar(req, res);
});

// === GET | Buscar Empresa por ID === //
router.get("/", function (req, res) {
  /* 
  OBS: Apenas "/" e não "/:empresaId" pois esta rota está sendo protegida pelo
  middleware de autenticação que anexa o campo "empresa_id" em "req.usuario".
  */
  empresaController.buscarPorId(req, res);
});

router.post("/codigos", function (req, res){
  empresaController.gerarCodigo(req, res);
});

module.exports = router;
