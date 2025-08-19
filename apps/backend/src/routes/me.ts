import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.use(authMiddleware);

router.get('/notifications', async (req, res) => {
  const user = (req as any).user as { id: string };
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

router.patch('/notifications/:id/read', async (req, res) => {
  const user = (req as any).user as { id: string };
  try {
    const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { readAt: new Date() } });
    if (updated.userId !== user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json({ id: updated.id, readAt: updated.readAt });
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
});

router.get('/points', async (req, res) => {
  const user = (req as any).user as { id: string };
  const items = await prisma.gamificationTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  const total = items.reduce((sum, t) => sum + t.points, 0);
  res.json({ total, items });
});

