const prisma = require('../lib/prisma');

const login = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "L'email est requis" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, 
      create: { 
        email, 
        name: email.split('@')[0] 
      }
    });
    res.json(user);
  } catch (error) {
    console.error(error); // Cela affichera l'erreur dans ton terminal
  res.status(500).json({ 
    error: "Détails techniques", 
    message: error.message 
  });
  }
};

module.exports = {
  login
};