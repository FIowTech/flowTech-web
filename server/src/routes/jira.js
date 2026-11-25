const express = require("express");
const router = express.Router();

const jiraController = require("../controllers/jiraController");

router.get(
  "/chamados-equipe",
  jiraController.buscarChamadosEquipeController
);

module.exports = router;