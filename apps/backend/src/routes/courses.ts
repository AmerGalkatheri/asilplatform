import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

export const router = Router();

router.get('/', async (_req, res) => {
  const items = await prisma.course.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
});

router.post('/', authMiddleware, requireRole('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  const schema = z.object({ title: z.string().min(3), description: z.string().min(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = (req as any).user as { id: string };
  const created = await prisma.course.create({ data: { ...parsed.data, authorUserId: user.id } });
  res.status(201).json(created);
});

router.post('/:id/enroll', authMiddleware, async (req, res) => {
  const user = (req as any).user as { id: string };
  try {
    const created = await prisma.enrollment.create({ data: { courseId: req.params.id, userId: user.id } });
    res.status(201).json(created);
  } catch (e) {
    return res.status(409).json({ error: 'Already enrolled or invalid' });
  }
});

router.get('/:id/progress', authMiddleware, async (req, res) => {
  const user = (req as any).user as { id: string };
  const enr = await prisma.enrollment.findUnique({ where: { courseId_userId: { courseId: req.params.id, userId: user.id } } });
  if (!enr) return res.status(404).json({ error: 'Not enrolled' });
  res.json({ progress: enr.progress, status: enr.status });
});

