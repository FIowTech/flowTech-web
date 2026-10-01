const ambiente_processo = "desenvolvimento";
const caminho_env = ambiente_processo === "producao" ? ".env" : ".env.dev";

require("dotenv").config({ path: caminho_env });

const PORTA_APP = process.env.APP_PORT;
const HOST_APP = process.env.APP_HOST;

const express = require("express");
const cors = require("cors");

const app = express();
const router = require("./src/routes/router");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

app.listen(PORTA_APP, () => {
  console.log(
    `[⚙️ ambiente = ${ambiente_processo}] Servidor Rodando em: http://${HOST_APP}:${PORTA_APP}`,
  );
});
