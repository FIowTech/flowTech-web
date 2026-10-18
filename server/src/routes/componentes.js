const express = require("express");
const componenteController = require("../controllers/componenteController");

const router = express.Router();

// === GET | Buscar Todos === //
router.get("/", function (req, res) {
  componenteController.buscar(req, res);
});

module.exports = router;
