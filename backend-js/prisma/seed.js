const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Créer l'utilisateur test
  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      id: 1,
      email: 'user@test.com',
      name: 'Utilisateur Test',
    },
  });

  // 2. Ajouter quelques mesures pour le graphique
  await prisma.healthRecord.createMany({
    data: [
      { userId: 1, type: 'BPM', value: 72, unit: 'bpm' },
      { userId: 1, type: 'BPM', value: 78, unit: 'bpm' },
      { userId: 1, type: 'BPM', value: 65, unit: 'bpm' },
      { userId: 1, type: 'Poids', value: 75.5, unit: 'kg' },
    ],
  });

  console.log(' Base de données initialisée avec succès !');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());