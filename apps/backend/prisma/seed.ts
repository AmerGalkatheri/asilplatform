import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@obar.local';
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, talentProfile: { create: { fullName: 'Demo User', skillsCsv: 'react,typescript,nextjs' } } }
  });

  const jobsCount = await prisma.job.count();
  if (jobsCount === 0) {
    await prisma.job.createMany({
      data: [
        { title: 'Frontend Engineer', description: 'React/Next.js developer', location: 'Riyadh', contractType: 'Full-time', experienceLevel: 'Mid', salaryMin: 12000, salaryMax: 18000 },
        { title: 'Backend Engineer', description: 'Node.js/NestJS developer', location: 'Remote', contractType: 'Contract', experienceLevel: 'Senior', salaryMin: 18000, salaryMax: 25000 }
      ]
    });
  }

  console.log('Seed completed. Demo user:', user.email);
}

main().finally(async () => {
  await prisma.$disconnect();
});

