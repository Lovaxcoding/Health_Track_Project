const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const healthRoutes = require('./health.routes');
const chatRoutes = require('./chat.routes');
const authRoutes = require("./auth.routes");

// On préfixe les routes pour une API propre
router.use("/auth", authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
router.use('/chat', chatRoutes);
router.get('/ping', (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Le routeur central répond bien !" 
  });
});

module.exports = router;