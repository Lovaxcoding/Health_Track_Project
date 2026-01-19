const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const userController = require('../controllers/user.controller');

// Route pour le Login / Inscription automatique
router.post("/login", userController.login);

module.exports = router;