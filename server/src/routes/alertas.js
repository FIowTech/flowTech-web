const express = require("express");
const alertaController = require("../controllers/alertaController");

const router = express.Router();

// === GET | Buscar alertas da empresa com paginação === //
router.get("/", function (req, res) {
  alertaController.buscar(req, res);
});

module.exports = router;
