const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les données d'un utilisateur
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const records = await prisma.healthRecord.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des données" });
  }
});

// Ajouter une nouvelle mesure
router.post('/', async (req, res) => {
  const { type, value, unit, userId } = req.body;
  try {
    const record = await prisma.healthRecord.create({
      data: { type, value: parseFloat(value), unit, userId: parseInt(userId) }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement" });
  }
});

module.exports = router;