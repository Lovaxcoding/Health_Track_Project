const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Accès refusé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ma_super_cle_secrete");
    req.userId = decoded.userId; // On attache l'ID à la requête
    next();
  } catch (e) {
    res.status(401).json({ error: "Token invalide" });
  }
};