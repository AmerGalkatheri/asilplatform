import { Router } from 'express';

export const router = Router();

router.get('/', async (_req, res) => {
  res.json({ status: 'healthy', time: new Date().toISOString() });
});

