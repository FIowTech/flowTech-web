const express = require("express");
const metricaController = require("../controllers/metricaController");

const router = express.Router();

// === GET | Buscar métricas (latest por padrão, agregado por período) === //
router.get("/", function (req, res) {
  metricaController.buscar(req, res);
});

module.exports = router;
