import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.get('/', async (req, res) => {
  const schema = z.object({ q: z.string().optional() });
  const parsed = schema.safeParse(req.query);
  const q = parsed.success && parsed.data.q ? parsed.data.q : undefined;
  const items = await prisma.job.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } }
          ]
        }
      : undefined,
    orderBy: { publishedAt: 'desc' }
  });
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

router.post('/', authMiddleware, async (req, res) => {
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    location: z.string().optional(),
    contractType: z.string().optional(),
    experienceLevel: z.string().optional(),
    salaryMin: z.number().int().optional(),
    salaryMax: z.number().int().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.job.create({ data: parsed.data });
  res.status(201).json(created);
});

// Applicants Kanban board
router.get('/:id/applicants/board', authMiddleware, async (req, res) => {
  const jobId = req.params.id;
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const applications = await prisma.application.findMany({
    where: { jobId },
    include: { user: { select: { id: true, email: true, talentProfile: true } } }
  });
  const statuses = ['RECEIVED', 'UNDER_REVIEW', 'INTERVIEW', 'REJECTED', 'HIRED'] as const;
  const columns: Record<string, any[]> = {};
  for (const s of statuses) columns[s] = [];
  for (const a of applications) columns[a.status]?.push(a);
  res.json({ jobId, columns });
});

