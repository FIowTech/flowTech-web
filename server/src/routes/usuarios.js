const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// === POST | Cadastrar Usuário === //
router.post("/cadastrar", function (req, res) {
  usuarioController.cadastrar(req, res);
});

// === POST | Logar Usuário === //
router.post("/login", function (req, res) {
  usuarioController.autenticar(req, res);
});

// === POST | Deslogar Usuário === //
router.post("/sair", authMiddleware, function (req, res) {
  usuarioController.sair(req, res);
});

module.exports = router;
