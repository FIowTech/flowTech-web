const express = require("express");
const goldController = require("../controllers/goldController");

const router = express.Router();

// situação de todos os embarcados da empresa 
router.get("/resumo", function (req, res) {
  goldController.resumo(req, res);
});

router.get(
  "/alertas-componentes",
  function (req, res) {
    goldController.alertasComponentes(
      req,
      res,
    );
  },
);

// histórico de um grupo (cpu, ram, disco, rede)
router.get("/embarcados/:embarcadoId/serie", function (req, res) {
  goldController.serie(req, res);
});

// ultimo retrato de um embarcado 
router.get("/embarcados/:embarcadoId", function (req, res) {
  goldController.snapshot(req, res);
});


module.exports = router;
