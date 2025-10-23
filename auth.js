const jwt = require("jsonwebtoken");


// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1]; //extraer token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar token con la clave secreta
    req.user = decoded; // Guardar datos del usuario en la request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

module.exports = { authMiddleware };
