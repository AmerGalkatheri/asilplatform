import { Router } from 'express';
import { z } from 'zod';

type Job = {
  id: string;
  title: string;
  location?: string;
  contractType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  publishedAt: string;
};

const jobs: Job[] = [
  { id: '1', title: 'Frontend Engineer', location: 'Riyadh', contractType: 'Full-time', experienceLevel: 'Mid', salaryMin: 12000, salaryMax: 18000, publishedAt: new Date().toISOString() },
  { id: '2', title: 'Backend Engineer', location: 'Remote', contractType: 'Contract', experienceLevel: 'Senior', salaryMin: 18000, salaryMax: 25000, publishedAt: new Date().toISOString() }
];

export const router = Router();

router.get('/', (req, res) => {
  const schema = z.object({ q: z.string().optional() });
  const parsed = schema.safeParse(req.query);
  const q = parsed.success && parsed.data.q ? parsed.data.q.toLowerCase() : '';
  const filtered = q ? jobs.filter(j => j.title.toLowerCase().includes(q)) : jobs;
  res.json({ items: filtered });
});

router.get('/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

