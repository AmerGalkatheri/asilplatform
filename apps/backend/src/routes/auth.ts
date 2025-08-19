import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

type UserRecord = { id: string; email: string; passwordHash: string };
const inMemoryUsers = new Map<string, UserRecord>();

export const router = Router();

router.post('/register', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  if (inMemoryUsers.has(email)) return res.status(409).json({ error: 'Email already used' });
  const passwordHash = await bcrypt.hash(password, 10);
  const record: UserRecord = { id: randomUUID(), email, passwordHash };
  inMemoryUsers.set(email, record);
  return res.status(201).json({ id: record.id, email: record.email });
});

router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = inMemoryUsers.get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token });
});

