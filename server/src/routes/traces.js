const express = require("express");
const tracesController = require("../controllers/tracesController");

const router = express.Router();

// === GET | Buscar traces (latest por padrão, agregado por período) === //
router.get("/", function (req, res) {
  tracesController.buscar(req, res);
});

module.exports = router;
