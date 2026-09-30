const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Token de acesso não encontrado.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;

    return next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";

    return res.status(401).json({
      message: isExpired
        ? "Token expirado. Faça login novamente."
        : "Token inválido.",
    });
  }
}

module.exports = authMiddleware;
