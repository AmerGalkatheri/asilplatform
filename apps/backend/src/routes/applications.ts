import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const schema = z.object({ jobId: z.string(), coverLetter: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = (req as any).user as { id: string };
  try {
    const created = await prisma.application.create({
      data: {
        jobId: parsed.data.jobId,
        userId: user.id,
        coverLetter: parsed.data.coverLetter
      }
    });
    res.status(201).json(created);
  } catch (e) {
    return res.status(409).json({ error: 'Already applied or invalid job' });
  }
});

router.get('/me', async (req, res) => {
  const user = (req as any).user as { id: string };
  const items = await prisma.application.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

