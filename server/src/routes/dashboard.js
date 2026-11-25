const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get(
  "/jira/chamados-responsaveis",
  dashboardController.getChamadosPorResponsavel
);

module.exports = router;