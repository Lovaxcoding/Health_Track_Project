require('dotenv').config();
const app = require('./app'); // On importe la configuration Express

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  *********************************************
  ✅ SERVEUR DE SANTÉ LANCÉ !
  🌍 URL : http://localhost:${PORT}
  📡 Teste le ping : http://localhost:${PORT}/api/ping
  *********************************************
  `);
});