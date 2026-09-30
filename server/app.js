const ambiente_processo = "desenvolvimento";
const caminho_env = ambiente_processo === "producao" ? ".env" : ".env.dev";

require("dotenv").config({ path: caminho_env });

const express = require("express");
const cors = require("cors");
const router = require("./src/routes/router");

const PORTA_APP = process.env.APP_PORT;
const HOST_APP = process.env.APP_HOST;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

app.listen(PORTA_APP, () => {
  console.log(
    `[⚙️ ambiente = ${ambiente_processo}] Servidor Rodando em: http://${HOST_APP}:${PORTA_APP}`,
  );
});
