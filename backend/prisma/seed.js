// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample tips
  const tips = await prisma.tip.createMany({
    data: [
      {
        category: 'transport',
        title: 'Bike to Work',
        description: 'Replace car commute with biking 2 days per week',
        impact: 'high',
        savings: 15.2,
        difficulty: 'medium'
      },
      {
        category: 'transport',
        title: 'Use Public Transit',
        description: 'Take bus or train instead of driving',
        impact: 'medium',
        savings: 8.5,
        difficulty: 'easy'
      },
      {
        category: 'food',
        title: 'Meat-Free Days',
        description: 'Have 2 plant-based days per week',
        impact: 'high',
        savings: 12.7,
        difficulty: 'easy'
      },
      {
        category: 'food',
        title: 'Buy Local Produce',
        description: 'Choose locally grown fruits and vegetables',
        impact: 'low',
        savings: 2.3,
        difficulty: 'easy'
      },
      {
        category: 'energy',
        title: 'LED Light Bulbs',
        description: 'Replace all incandescent bulbs with LEDs',
        impact: 'medium',
        savings: 5.8,
        difficulty: 'easy'
      },
      {
        category: 'energy',
        title: 'Smart Thermostat',
        description: 'Install and program a smart thermostat',
        impact: 'medium',
        savings: 7.2,
        difficulty: 'medium'
      }
    ],
    skipDuplicates: true
  });

  console.log(`✅ Created ${tips.count} tips`);

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ecotrack.com' },
    update: {},
    create: {
      email: 'demo@ecotrack.com',
      password: hashedPassword,
      name: 'Demo User'
    }
  });

  console.log('✅ Created demo user:', demoUser.email);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });