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
//supprimer une mesure
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try{
    const deleteRecord = await prisma.healthRecord.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Mesure supprimée avec succès", deleteRecord });
  }
  catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

module.exports = router;