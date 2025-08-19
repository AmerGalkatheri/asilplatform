import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.post('/upload', authMiddleware, async (req, res) => {
  // Placeholder for future multipart handling. For now, create a fake record.
  const user = (req as any).user as { id: string };
  const created = await prisma.resume.create({ data: { userId: user.id, filename: 'cv.pdf', mimetype: 'application/pdf', size: 0, path: '/tmp/cv.pdf' } });
  res.status(201).json(created);
});

router.post('/:id/parse', authMiddleware, async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!resume) return res.status(404).json({ error: 'Not found' });
  const parsed = await prisma.resumeParseResult.upsert({
    where: { resumeId: resume.id },
    update: { skillsCsv: 'typescript,node,react', summary: 'Experienced engineer' },
    create: { resumeId: resume.id, skillsCsv: 'typescript,node,react', summary: 'Experienced engineer' }
  });
  res.json(parsed);
});

