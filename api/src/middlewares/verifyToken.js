const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token manquant (Bearer)",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Server Error",
        message: "JWT_SECRET manquant",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, email, role, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token invalide ou expiré",
    });
  }
};
