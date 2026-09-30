const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth")

const usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", authMiddleware, function (req, res) {
  usuarioController.cadastrar(req, res);
});

router.post("/login", function (req, res) {
  usuarioController.login(req, res);
});

module.exports = router;
