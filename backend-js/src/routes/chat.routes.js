const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1',
});

router.get("/:userId", async (req, res) => {
    const idFromParams = parseInt(req.params.userId);
  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId: idFromParams },
      orderBy: { createdAt: "asc" },
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Erreur historique" });
  }
});

router.post("/", async (req, res) => {
  const { userId, content } = req.body;
  try {
    const healthData = await prisma.healthRecord.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const context = healthData.map((r) => `${r.type}: ${r.value}${r.unit || ""}`).join(", ");

    const prompt = `Tu es HealthPulse AI, assistant santé. 
    Données : [${context || "Aucune"}]. 
    Question : "${content}". 
    Réponds en 3 phrases max, sois humain et encourageant.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Utilise 1.5 ou 2.0 selon ta clé
      contents: prompt,
    });

   let aiResponse;
    try {
        const response = await result.response;
        aiResponse = response.text();
    } catch (e) {
        // Sécurité si la structure diffère
        aiResponse = result.text || "Désolé, je n'ai pas pu générer de texte.";
    }

    const savedMessages = await prisma.$transaction([
      prisma.chatMessage.create({ data: { userId: parseInt(userId), role: "user", content } }),
      prisma.chatMessage.create({ data: { userId: parseInt(userId), role: "assistant", content: aiResponse } }),
    ]);

    res.json(savedMessages);
  } catch (error) {
    console.error("❌ Gemini Error:", error);
    const status = error.status === 429 ? 429 : 500;
    res.status(status).json({ error: "L'IA est indisponible." });
  }
});

module.exports = router;