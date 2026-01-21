const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "ma_super_cle_secrete";

//  Inscription (Optionnel pour tes tests, tu peux utiliser le seed)
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    res.json({ message: "Utilisateur créé !" });
  } catch (e) {
    res.status(400).json({ error: "Email déjà utilisé" });
  }
});

// 🔑 Connexion (Le moment où on génère le Token)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

  // On crée le token qui contient l'ID de l'utilisateur
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });

  res.json({ token, user: { id: user.id, name: user.name } });
});

module.exports = router;