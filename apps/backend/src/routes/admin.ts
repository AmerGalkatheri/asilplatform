import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

export const router = Router();

router.use(authMiddleware, requireRole('ADMIN'));

router.get('/users', async (_req, res) => {
  const items = await prisma.user.findMany({ select: { id: true, email: true, role: true }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

router.patch('/users/:id/role', async (req, res) => {
  const schema = z.object({ role: z.enum(['ADMIN','RECRUITER','INSTRUCTOR','TALENT']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { role: parsed.data.role } });
    res.json({ id: updated.id, role: updated.role });
  } catch (e) {
    return res.status(404).json({ error: 'User not found' });
  }
});

