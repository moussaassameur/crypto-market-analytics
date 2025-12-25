module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized", message: "Non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden", message: "Accès admin requis" });
  }

  next();
};
