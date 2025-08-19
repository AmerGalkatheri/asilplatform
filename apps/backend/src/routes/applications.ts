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

router.patch('/:id/status', async (req, res) => {
  const schema = z.object({ status: z.enum(['RECEIVED', 'UNDER_REVIEW', 'INTERVIEW', 'REJECTED', 'HIRED']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const updated = await prisma.application.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    res.json(updated);
  } catch (e) {
    return res.status(404).json({ error: 'Application not found' });
  }
});

router.patch('/:id/rating', async (req, res) => {
  const schema = z.object({ rating: z.number().int().min(1).max(5) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const updated = await prisma.application.update({ where: { id: req.params.id }, data: { rating: parsed.data.rating } });
    res.json(updated);
  } catch (e) {
    return res.status(404).json({ error: 'Application not found' });
  }
});

router.post('/:id/notes', async (req, res) => {
  const schema = z.object({ content: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = (req as any).user as { id: string };
  try {
    const created = await prisma.applicationNote.create({
      data: { applicationId: req.params.id, authorUserId: user.id, content: parsed.data.content }
    });
    res.status(201).json(created);
  } catch (e) {
    return res.status(404).json({ error: 'Application not found' });
  }
});

router.get('/:id/notes', async (req, res) => {
  const notes = await prisma.applicationNote.findMany({
    where: { applicationId: req.params.id },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, email: true } } }
  });
  res.json({ items: notes });
});

