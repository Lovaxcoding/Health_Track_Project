const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { GoogleGenAI } = require("@google/genai");
const auth = require("../middleware/auth.middleware");


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1',
});



// On ajoute 'auth' comme deuxième argument pour protéger la route
router.get("/", auth, async (req, res) => {
  const history = await prisma.chatMessage.findMany({
    where: { userId: req.userId }, // req.userId vient du middleware !
    orderBy: { createdAt: "asc" },
  });
  res.json(history);
});

router.post("/", auth, async (req, res) => {
  const userId = req.userId; 
  const { content } = req.body;
  try {
    // 1. Récupération simultanée de TOUTES les données (Profil + Santé + Historique)
    const [user, healthData, chatHistory] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.healthRecord.findMany({ 
        where: { userId }, 
        orderBy: { createdAt: "desc" }, 
        take: 10 
      }),
      prisma.chatMessage.findMany({ 
        where: { userId }, 
        orderBy: { createdAt: "desc" }, 
        take: 6 
      })
    ]);

    // 2. Préparation du contexte pour l'IA
    const contextHealth = healthData.map((r) => `${r.type}: ${r.value}${r.unit || ""}`).join(", ");
    const contextChat = chatHistory.reverse().map(m => `${m.role === 'user' ? 'Lui' : 'Toi'}: ${m.content}`).join("\n");

    // 3. Prompt enrichi (Français uniquement)

    const prompt = `Tu es HealthPulse AI, un assistant santé humain et chaleureux.
    IDENTITÉ UTILISATEUR : Nom: ${user?.name || "Ami"}, Email: ${user?.email}.
    DONNÉES SANTÉ RÉCENTES : [${contextHealth || "Aucune donnée disponible"}].
    CONTEXTE DE LA CONVERSATION :
    ${contextChat}

    QUESTION DE L'UTILISATEUR : "${content}"

    INSTRUCTIONS :
    - Commence TOUJOURS ta réponse en appelant l'utilisateur par son nom : ${user?.name}.
    - Utilise des emojis expressifs (✨, 🩺, 💪, 💧).
    - Utilise le format Markdown (Gras, listes à puces) pour structurer tes conseils.
    - Sois humain, encourageant et base-toi sur tes connaissances en bien-être.
    - Limite-toi à 4 phrases maximum.
    - Si tu vois des données de santé, commente-les brièvement de façon positive.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Utilise 1.5 ou 2.0 selon ta clé
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
  // DELETE : Effacer l'historique
router.delete("/", auth, async (req, res) => {
  try {
    await prisma.chatMessage.deleteMany({
      where: { userId: req.userId },
    });
    res.json({ message: "Historique supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

module.exports = router; 