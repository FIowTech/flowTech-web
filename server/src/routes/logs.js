const express = require("express");
const logController = require("../controllers/logController");

const router = express.Router();

// === GET | Buscar Logs com paginação === //
router.get("/", function (req, res) {
  logController.buscar(req, res);
});

module.exports = router;
