const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const healthRoutes = require('./health.routes');

// On préfixe les routes pour une API propre
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
router.get('/ping', (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Le routeur central répond bien !" 
  });
});

module.exports = router;