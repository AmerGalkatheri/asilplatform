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
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: { lessons: { orderBy: { order: 'asc' } } } });
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

router.post('/:id/lessons', authMiddleware, requireRole('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  const schema = z.object({ title: z.string().min(3), content: z.string().min(1), order: z.number().int().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.lesson.create({ data: { courseId: req.params.id, ...parsed.data } });
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

router.post('/:id/progress', authMiddleware, async (req, res) => {
  const user = (req as any).user as { id: string };
  const schema = z.object({ progress: z.number().int().min(0).max(100) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const enr = await prisma.enrollment.update({ where: { courseId_userId: { courseId: req.params.id, userId: user.id } }, data: { progress: parsed.data.progress } });
  if (enr.progress >= 100) {
    await prisma.certificate.upsert({ where: { enrollmentId: enr.id }, update: {}, create: { enrollmentId: enr.id } });
    await prisma.gamificationTransaction.create({ data: { userId: user.id, points: 50, reason: 'COURSE_COMPLETION' } });
    await prisma.notification.create({ data: { userId: user.id, message: `Congratulations! Certificate issued for course ${req.params.id}` } });
  }
  res.json({ progress: enr.progress });
});

