const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

const usuariosRouter = require("./usuarios");
const empresasRouter = require("./empresas");
const embarcadosRouter = require("./embarcados");
const codigoDeAcessoRouter = require("./codigos-acesso");

router.use("/usuarios", usuariosRouter);
router.use("/empresas", authMiddleware, empresasRouter);
router.use("/embarcados", authMiddleware, embarcadosRouter);
router.use("/codigos", authMiddleware, codigoDeAcessoRouter);

module.exports = router;

// Verbos HTTP: GET, POST, PUT, DELETE
/* Estrutura de Endpoints por Recurso

Usuário (/usuarios)
- POST /login           | {{baseUrl}}/usuarios/login
- POST /cadastrar       | {{baseUrl}}/usuarios/cadastrar
- POST /logout          | {{baseUrl}}/usuarios/logout

Empresa (/empresas)
- POST  /cadastrar      | {{baseUrl}}/empresas/cadastrar
- GET   /:empresaId     | {{baseUrl}}/empresas/:empresaId

Embarcado (/embarcados)
- POST      /cadastrar              | {{baseUrl}}/embarcados/cadastrar          | {{baseUrl}}/empresas/:empresaId/embarcados/cadastrar
- PUT       /:embarcadoId/editar    | {{baseUrl}}/embarcados/:embarcadoId       | {{baseUrl}}/empresas/:empresaId/embarcados/:embarcadoId/editar
- DELETE    /:embarcadoId/excluir   | {{baseUrl}}/embarcados/:embarcadoId       | {{baseUrl}}/empresas/:empresaId/embarcados/:embarcadoId/excluir
- GET       /                       | {{baseUrl}}/embarcados/
- GET       /:embarcadoId           | {{baseUrl}}/embarcado/:embarcadoId

Parametro (/parametros)

- POST      /cadastrar
- PUT       /editar/:parametroId
- DELETE    /excluir/:paramteroId
- GET       /

Componente (/componentes)

- GET       /
- GET       /:componenteId

Metricas (/metricas)

- GET /embarcados/:empresaId
- DELETE /excluir/
*/
